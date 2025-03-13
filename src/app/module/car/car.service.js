
    const { default: status } = require("http-status");  
    const Car = require("./Car");
    const QueryBuilder = require("../../../builder/queryBuilder");
    const ApiError = require("../../../error/ApiError");
    const validateFields = require("../../../util/validateFields");

    const postCar = async (userData, payload) => {
    // Add your logic here
    };

    const getCar = async (userData, query) => {
        validateFields(query, ["carId"]);

        const car = await Car.findOne({
        _id: query.carId,
        }).lean();

        if (!car)
        throw new ApiError(status.NOT_FOUND, "Car not found");

        return car;
    };

    const getAllCars = async (userData, query) => {
        const carQuery = new QueryBuilder(
        Car.find({}).lean(),
        query
        )
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields();

        const [car, meta] = await Promise.all([
        carQuery.modelQuery,
        carQuery.countTotal(),
        ]);

        return {
        meta,
        cars,
        };
    };

    const updateCar = async (userData, payload) => {
    // Add your logic here
    };

    const deleteCar = async (userData, payload) => {
        validateFields(payload, ["carId"]);

        const car = await Car.deleteOne({
        _id: payload.carId,
        });

        if (!car.deletedCount)
        throw new ApiError(status.NOT_FOUND, "Car not found");

        return car;
    };

    const CarService = {
    postCar,
    getCar,
    getAllCars,
    updateCar,
    deleteCar,
    };

    module.exports =  CarService ;  
  