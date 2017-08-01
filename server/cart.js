"use strict";

const router = require("express").Router();
const db = require("APP/db");

module.exports = router;

// SB KH - clean up logic about how we are handling session.cart
// try logging your cart more!
// plan for when the array is empty -- what do we want the front end to receive?

// GET api/product
router.get("/", function(req, res, next) {
  // Product.findAll()
  //   .then(products => res.json(products))
  //   .catch(next);
  console.log("fetching cart from session ", req.session.cart)
  res.json(req.session.cart);
});


// SB KH - put comments in your code to keep track of ToDos
// multiline comments at top


// POST /api/product
router.post("/", function(req, res, next) {
  if (!req.session.cart) req.session.cart = [];

  req.session.cart.push(req.body);
    console.log("after push " , req.session.cart);
});

// DELETE /api/product
router.delete("/:productId", function(req, res, next) {
  const id = req.params.productId;

  console.log("delete ", id);

  Product.destroy({ where: { id } })
    .then(() => res.status(204).end())
    .catch(next);
});

// You usually want to send the product back when you update it
router.put("/:productId", function(req, res, next) {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(product => product.update(req.body))
    .then(update2 => res.status(204).end())
    .catch(next);
});
