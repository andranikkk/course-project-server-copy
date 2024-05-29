const { prisma } = require("../prisma/prisma-client");

const ItemController = {
  createItem: async (req, res) => {
    const { name, tags, collectionId, categoryId, content } = req.body;
    const authorId = req.user.userId;

    if (!name || !tags) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const item = await prisma.item.create({
        data: {
          name,
          tags,
          userId: authorId,
          collectionId,
          categoryId,
          content,
        },
      });

      res.json(item);
    } catch (error) {
      console.error("Error creating item", error);
      res.status(500).json({ error: "Error creating item" });
    }
  },

  getAllItems: async (req, res) => {
    const userId = req.user.userId;

    try {
      const items = await prisma.item.findMany({
        include: {
          collection: true,
          Like: true,
          Comment: true,
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const likeInfo = items.map((item) => ({
        ...item,
        likedByUser: item.Like.some((like) => like.userId === userId),
      }));

      res.json(likeInfo);
    } catch (error) {
      console.error("Error getting items", error);
      res.status(500).json({ error: "Error getting items" });
    }
  },

  getItemById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const item = await prisma.item.findUnique({
        where: {
          id,
        },
        include: {
          Comment: {
            include: {
              user: true,
            },
          },
          collection: true,
          Like: true,
          user: true,
        },
      });

      if (!item) {
        return res.status(404).json({ error: "Item Not Found" });
      }

      const likeInfo = {
        ...item,
        likedByUser: item.Like.some((like) => like.userId === userId),
      };

      res.json(likeInfo);
    } catch (error) {
      console.error("Error getting item", error);
      res.status(500).json({ error: "Error getting item" });
    }
  },

  editItem: async (req, res) => {
    const {
      id,
      name,
      tags,
      categoryId,
      content,
      collectionId,
      custom_string1_state,
      custom_string1_name,
      custom_string2_state,
      custom_string2_name,
      custom_string3_state,
      custom_string3_name,
      custom_int1_state,
      custom_int1_name,
      custom_int2_state,
      custom_int2_name,
      custom_int3_state,
      custom_int3_name,
    } = req.body;

    const item = await prisma.item.findUnique({ where: id });

    if (item?.userId !== req.user?.userId) {
      return res.status(403).json({ error: "No permission" });
    }

    try {
      const updatedItem = await prisma.item.update({
        where: id,
        data: {
          id: id,
          name: name || undefined,
          tags: tags || undefined,
          categoryId: categoryId || undefined,
          content: content || undefined,
          collectionId: collectionId || undefined,
          custom_string1_state: custom_string1_state || undefined,
          custom_string1_name: custom_string1_name || undefined,
          custom_string2_state: custom_string2_state || undefined,
          custom_string2_name: custom_string2_name || undefined,
          custom_string3_state: custom_string3_state || undefined,
          custom_string3_name: custom_string3_name || undefined,
          custom_int1_state: custom_int1_state || undefined,
          custom_int1_name: custom_int1_name || undefined,
          custom_int2_state: custom_int2_state || undefined,
          custom_int2_name: custom_int2_name || undefined,
          custom_int3_state: custom_int3_state || undefined,
          custom_int3_name: custom_int3_name || undefined,
        },
      });

      res.json(updatedItem);
    } catch (error) {
      console.error("Error editing item", error);
      res.status(500).json({ error: "Error editing item" });
    }
  },

  deleteItem: async (req, res) => {
    const { id } = req.params;

    try {
      const item = await prisma.item.findUnique({ where: { id } });

      if (!item) {
        return res.status(404).json({ error: "Item Not Found" });
      }

      if (item.userId !== req.user.userId) {
        return res.status(403).json({ error: "No permission" });
      }

      await prisma.$transaction([
        prisma.comment.deleteMany({ where: { itemId: id } }),
        prisma.like.deleteMany({ where: { itemId: id } }),
        prisma.item.delete({ where: { id } }),
      ]);

      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item", error);
      res.status(500).json({ error: "Error deleting item" });
    }
  },
};

module.exports = ItemController;
