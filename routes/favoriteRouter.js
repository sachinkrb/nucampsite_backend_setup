const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const favoriteRouter = express.Router();
const cors = require("./cors");

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        console.log("favorite" + favorite);
        if (favorite) {
          console.log("favorite.campsites" + favorite.campsites);
          req.body.forEach(fav => {
            console.log("fav._id" + fav._id);
            if (!favorite.campsites.includes(fav._id)) {

              favorite.campsites.push(fav._id);
            }
          });
          favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => next(err));
        } else {
          Favorite.create({ user: req.user._id })
            .then(favorite => {
              req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                  favorite.campsites.push(fav._id);
                }
              });
              favorite.save()
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch(err => next(err));
            })
        }
      })
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.setHeader("Content-Type", "text/plain");
          res.end("You do not have any favorites to delete.");
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        `Get operation not supported on /favorites/${ req.params.campsiteId }`
      );
    }
  )
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("That campsite is already in the list of favorites!");
          }
          favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => next(err));
        } else {
          Favorite.create({ user: req.user._id })
            .then(favorite => {
              if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
              }
              favorite.save()
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch(err => next(err));
            })
        }
      })
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        `Put operation not supported on favorite/campsiteId!`
      );
    }
  )
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findByIdAndDelete(req.params.campsiteId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;