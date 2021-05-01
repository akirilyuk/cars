module.exports = ({ mongoose }) => {
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
  return Model;
};
