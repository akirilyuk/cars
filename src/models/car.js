/* eslint-disable no-underscore-dangle */
module.exports = ({ mongoose, ajv }) => {
  const COLOR = { BLUE: 'blue', RED: 'red', GREEN: 'green', YELLOW: 'yellow' };
  const VENDOR = { BMW: 'bmw', MERCEDES: 'mercedes', VOLKSWAGEN: 'volkswagen' };
  const SEATS = { TWO: 2, FOUR: 4, SIX: 6 };
  const schema = new mongoose.Schema({
    color: {
      type: String,
      enum: Object.values(COLOR),
      default: COLOR.BLUE
    }, // color of the car, eg blue, red, brown etc
    vendor: {
      type: String,
      enum: Object.values(VENDOR),
      default: VENDOR.BMW
    }, // car vendor
    seats: {
      type: Number,
      enum: Object.values(SEATS),
      default: SEATS.FOUR
    }, // car size
    cabrio: Boolean, // is this a cabrio or not
    automaticTransmission: Boolean //  true for automatic, false for manual
  });

  const ajvSchemaCreate = {
    type: 'object',
    properties: {
      color: {
        type: 'string',
        enum: Object.values(COLOR)
      },
      vendor: {
        type: 'string',
        enum: Object.values(VENDOR)
      },
      seats: {
        type: 'integer',
        enum: Object.values(SEATS)
      },
      cabrio: {
        type: 'boolean'
      },
      automaticTransmission: {
        type: 'boolean'
      }
    },
    required: ['color', 'vendor', 'seats', 'cabrio', 'automaticTransmission'],
    additionalProperties: false
  };

  const ajvSchemaUpdate = {
    type: 'object',
    properties: {
      ...ajvSchemaCreate.properties,
      id: {
        type: 'string'
      }
    },
    required: ['id'],
    anyOf: [
      { required: ['color'] },
      { required: ['vendor'] },
      { required: ['seats'] },
      { required: ['cabrio'] },
      { required: ['automaticTransmission'] }
    ],
    additionalProperties: false
  };

  schema.methods.toJSON = function () {
    const jsonObject = {
      ...this._doc,
      id: this._id.toString()
    };

    delete jsonObject.__v;
    delete jsonObject._id;

    return jsonObject;
  };
  const Model = mongoose.model('Car', schema);
  Model.ENUMS = {
    COLOR,
    VENDOR,
    SEATS
  };

  /**
   * Create and validate the
   * @param scheme {object} ajv schema validation object
   * @param data {object} request body data
   * @return {string|null}
   */
  Model.createAndEvaluateValidation = (scheme, data) => {
    const validation = ajv.compile(scheme);
    const validationResult = validation(data);
    if (!validationResult) {
      return JSON.stringify(validation.errors);
    }
    return null;
  };

  /**
   * Validates the provided data if it matches the update schema
   * @param data {object} request body
   * @return {string} on success null, else a string containing the validation errors
   */
  Model.validateUpdate = data => {
    return Model.createAndEvaluateValidation(ajvSchemaUpdate, data);
  };

  /**
   * Validates the provided data if it matches the create schema
   * @param data {object} request body
   * @return {string} on success null, else a string containing the validation errors
   */
  Model.validateCreate = data => {
    return Model.createAndEvaluateValidation(ajvSchemaCreate, data);
  };
  return Model;
};
