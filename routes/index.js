const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  UserController,
  CollectionController,
  CommentController,
  ItemController,
  LikeController,
} = require("../controllers");
const authenticateToken = require("../middleware/auth");

const uploadDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploads = multer({
  storage: storage,
});

//
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.current);
router.get("/users/:id", authenticateToken, UserController.getUserById);
router.put(
  "/users/:id",
  authenticateToken,
  uploads.single("avatar"),
  UserController.updateUser
);

//
router.post(
  "/collections",
  authenticateToken,
  CollectionController.createCollection
);
router.delete(
  "/collections/:id",
  authenticateToken,
  CollectionController.deleteCollection
);
router.get(
  "/collections",
  authenticateToken,
  CollectionController.getAllCollections
);
router.put(
  "/collections/:id",
  authenticateToken,
  CollectionController.editCollection
);
router.get(
  "/collections/:id",
  authenticateToken,
  CollectionController.getCollectionById
);

//
router.post("/comments", authenticateToken, CommentController.createComment);
router.delete(
  "/comments/:id",
  authenticateToken,
  CommentController.deleteComment
);

//
router.post("/items", authenticateToken, ItemController.createItem);
router.get("/items", authenticateToken, ItemController.getAllItems);
router.get("/items/:id", authenticateToken, ItemController.getItemById);
router.put("/items/:id", authenticateToken, ItemController.editItem);
router.delete("/items/:id", authenticateToken, ItemController.deleteItem);

//
router.post("/likes", authenticateToken, LikeController.likeItem);
router.delete("/likes/:id", authenticateToken, LikeController.unlikeItem);

module.exports = router;
