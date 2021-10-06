const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//oder validators
function newOrderIsValid(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    if (!deliverTo || deliverTo.length === 0) {
      return next({
        status: 400,
        message: "Order must include a deliverTo",
      });
    } else if (!mobileNumber || mobileNumber.length === 0) {
      return next({
        status: 400,
        message: "Order must include a mobileNumber",
      });
    } else if (!dishes) {
      return next({
        status: 400,
        message: "Order must include a dish",
      });
    } else if (!Array.isArray(dishes) || dishes.length === 0) {
      return next({
        status: 400,
        message: "Order must include at least one dish",
      });
    }
    dishes.forEach((dish, index) => {
      if (
        !dish.quantity ||
        dish.quantity <= 0 ||
        !Number.isInteger(dish.quantity)
      ) {
        return next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        });
      }
    });
  
    next();
  }
  
  function updateOrderIsValid(req, res, next) {
    const { data: { id, deliverTo, mobileNumber, dishes, status } = {} } =
      req.body;
    const statusOptions = [
      "pending",
      "preparing",
      "out-for-delivery",
      "delivered",
    ];
    if (!deliverTo || deliverTo.length === 0) {
      return next({
        status: 400,
        message: "Order must include a deliverTo",
      });
    } else if (!mobileNumber || mobileNumber.length === 0) {
      return next({
        status: 400,
        message: "Order must include a mobileNumber",
      });
    } else if (!dishes) {
      return next({
        status: 400,
        message: "Order must include a dish",
      });
    } else if (!Array.isArray(dishes) || dishes.length === 0) {
      return next({
        status: 400,
        message: "Order must include at least one dish",
      });
    } else if (!status || status.length === 0) {
      return next({
        status: 400,
        message:
          "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
    } else if (!statusOptions.includes(status)) {
      return next({
        status: 400,
        message:
          "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
    } else if (status === "delivered") {
      return next({
        status: 400,
        message: "A delivered order cannot be changed",
      });
    } else if (id && res.locals.foundOrder.id !== id) {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${res.locals.foundOrder.id}.`,
      });
    }
    dishes.forEach((dish, index) => {
      if (
        !dish.quantity ||
        dish.quantity <= 0 ||
        !Number.isInteger(dish.quantity)
      ) {
        return next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        });
      }
    });
  
    next();
  }
  
  function orderIsPending(req, res, next) {
    if (res.locals.foundOrder.status !== "pending") {
      return next({
        status: 400,
        message: "An order cannot be deleted unless it is pending",
      });
    }
    next();
  }
  
  function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      res.locals.foundOrder = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `Order with ID ${orderId} does not exist`,
    });
  }
  //GET all orders
  function list(req, res) {
    res.json({ data: orders });
  }
  //POST new order
  function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
      id: nextId(),
      deliverTo,
      mobileNumber,
      dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }
  //GET one order
  function read(req, res) {
    res.json({ data: res.locals.foundOrder });
  }
//PUT update
  function update(req, res) {
    const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
    const foundOrder = res.locals.foundOrder;
    if (
      foundOrder.deliverTo !== deliverTo ||
      foundOrder.mobileNumber !== mobileNumber ||
      foundOrder.dishes !== dishes ||
      foundOrder.status !== status
    ) {
      foundOrder.deliverTo = deliverTo;
      foundOrder.mobileNumber = mobileNumber;
      foundOrder.dishes = dishes;
      foundOrder.status = status;
    }
    res.json({ data: foundOrder });
  }
  //DELETE order
  function destroy(req, res) {
    const { orderId } = req.params;
    const foundIndex = orders.findIndex((order) => order.id === orderId);
    orders.splice(foundIndex, 1);
    res.sendStatus(204);
  }
  
  module.exports = {
    list,
    create: [newOrderIsValid, create],
    read: [orderExists, read],
    update: [orderExists, updateOrderIsValid, update],
    delete: [orderExists, orderIsPending, destroy],
  };