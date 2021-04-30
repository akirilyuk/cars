module.exports = ({ mongoose: { Schema } }) => {
  const COLOR = ['blue', 'red', 'green', 'yellow', 'black'];
  const VENDOR = ['Bmw', 'Mercedes', 'Volkswagen'];
  const SEATS = [2, 4, 6];
  const model = new Schema({
    color: {
      type: String,
      enum: COLOR,
      default: COLOR[0]
    }, // color of the car, eg blue, red, brown etc
    vendor: {
      type: String,
      enum: VENDOR,
      default: VENDOR[0]
    }, // car vendor
    seats: {
      type: Number,
      enum: SEATS,
      default: SEATS
    }, // car size
    cabrio: Boolean, // is this a cabrio or not
    transmisssion: Boolean // fo
  });
  model.ENUMS = {
    COLOR,
    VENDOR,
    SEATS
  };
  return model;
};
