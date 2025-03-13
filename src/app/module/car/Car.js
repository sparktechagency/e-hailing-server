
    const { Schema, model } = require("mongoose");
    const ObjectId = Schema.Types.ObjectId;

    const carSchema = new Schema(
    {
        
    },
    {
        timestamps: true,
    }
    );

    const Car = model("Car", carSchema);

    module.exports = Car;
    