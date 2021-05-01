/* eslint-disable no-underscore-dangle */
module.exports = ({ mongoose, ajv }) => {
  const COLOR = { BLUE: 'blue', RED: 'red', GREEN: 'green', YELLOW: 'yellow' };
  const VENDOR = { BMW: 'bmw', MERCEDES: 'mercedes', VOLKSWAGEN: 'volkswagen' };
  const SEATS = { TWO: 2, FOUR: 4, SIX: 6 };
  const mongoSchema = {
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
  };
  const schema = new mongoose.Schema(mongoSchema);

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
   * Create and validate the payload by the proivided ajv validation. Why are we not using the build in mongoose validations?
   *
   * https://mongoosejs.com/docs/documents.html#validating
   *
   * Because of speed?
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

  /**
   * Create an empty object containing all the cars metadata in an object with each value set to zero.
   * @return {{
        count: 0,
        color: {
          blue: 0,
          green: 0,
          red: 0,
          yellow: 0
        },
        vendor: {
          bmw: 0,
          mercedes: 0,
          volkswagen: 0
        },
        seats: {
          2: 0,
          4: 0,
          6: 0
        },
        cabrio: {
          true: 0,
          false: 0
        },
        automaticTransmission: {
          true: 0,
          false: 0
        }
      }}
   */
  Model.createEmptyMeta = () => {
    const emptyMeta = { ...mongoSchema };
    Object.keys(emptyMeta).forEach(key => {
      const property = emptyMeta[key];
      if (property.enum) {
        const enumValuesCount = {};
        emptyMeta[key].enum.forEach(enumValue => {
          enumValuesCount[enumValue] = 0;
        });
        emptyMeta[key] = enumValuesCount;
      } else {
        emptyMeta[key] = {
          true: 0,
          false: 0
        };
      }
    });
    emptyMeta.count = 0;
    return emptyMeta;
  };

  /**
   * First creates an empty metdata object, then iterates over all models in the db. Then we iterate over each property
   * and count each value increasing count for the occurance of each property inside the empty metadata by one.
   *
   * For an complete example of the returned payload see the integration test inside
   *  api-cars.test.js -> 'test GET /api/car' -> 'should return 200 and right number ob meta count in db'
   *
   * @return {}
   */
  Model.getAllCarsMeta = async () => {
    const meta = Model.createEmptyMeta();
    const allCars = await Model.find({});
    meta.count = allCars.length;
    allCars.forEach(car => {
      Object.entries(car._doc).forEach(([propertyKey, propertyValue]) => {
        // ignore _id and _v property
        if (propertyKey !== '_id' && propertyKey !== '__v') {
          // to string the propertyValue so we can also map boolean values in our object :)
          meta[propertyKey][propertyValue.toString()] += 1;
        }
      });
    });
    return meta;
  };
  return Model;
};
