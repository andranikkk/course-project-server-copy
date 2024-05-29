const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");

const CollectionController = {
  createCollection: async (req, res) => {
    const { name, description, categoryId } = req.body;
    const authorId = req.user.userId;

    const png = Jdenticon.toPng(`${name}${Date.now()}`, 200);
    const collectionAvatar = `${name}_${Date.now()}.png`;
    const collectionAvatarPath = path.join(
      __dirname,
      "/../uploads",
      collectionAvatar
    );
    fs.writeFileSync(collectionAvatarPath, png);

    try {
      const collection = await prisma.collection.create({
        data: {
          authorId,
          name,
          description,
          categoryId,
          imageUrl: `/uploads/${collectionAvatar}`,
        },
      });

      res.json(collection);
    } catch (error) {
      console.error("Error while creating collection", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  getAllCollections: async (req, res) => {
    try {
      const collection = await prisma.collection.findMany({
        include: {
          author: true,
          items: {
            include: {
              Like: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(collection);
    } catch (error) {
      console.error("Error while getting collections", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  getCollectionById: async (req, res) => {
    const { id } = req.params;

    try {
      const collection = await prisma.collection.findUnique({
        where: {
          id,
        },
        include: {
          author: true,
          items: {
            include: {
              Like: true,
            },
          },
        },
      });

      if (!collection) {
        return res.status(404).json({ error: "Collection Not Found" });
      }

      res.json(collection);
    } catch (error) {
      console.error("Error while getting collection", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  editCollection: async (req, res) => {
    const { name, description, categoryId, id } = req.body;
    const collection = await prisma.collection.findUnique({ where: id });
    const userId = req.user?.userId;

    if (collection?.authorId !== userId) {
      return res.status(403).json({ error: "No permission" });
    }

    try {
      const updatedCollection = await prisma.collection.update({
        where: id,
        data: {
          id: id,
          name: name || undefined,
          description: description || undefined,
          categoryId: categoryId || undefined,
        },
      });

      res.json(updatedCollection);
    } catch (error) {
      console.error("Error editing item", error);
      res.status(500).json({ error: "Error editing item" });
    }
  },

  deleteCollection: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(403).json({ error: "Id is not defined" });
      }

      const collection = await prisma.collection.findUnique({ where: { id } });

      if (!collection) {
        return res.status(404).json({ error: "Collection Not Found" });
      }

      if (collection.authorId !== req.user.userId) {
        return res.status(403).json({ error: "No permission" });
      }

      const items = await prisma.item.findMany({ where: { collectionId: id } });
      const itemIds = items.map((item) => item.id);

      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { itemId: { in: itemIds } } }),
        prisma.like.deleteMany({ where: { itemId: { in: itemIds } } }),
        prisma.item.deleteMany({ where: { collectionId: id } }),
        prisma.collection.delete({ where: { id } }),
      ]);

      res.json(transaction);
    } catch (error) {
      console.error("Error while deleting collection", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = CollectionController;
