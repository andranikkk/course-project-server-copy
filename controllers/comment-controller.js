const { prisma } = require("../prisma/prisma-client");

const CommentController = {
  createComment: async (req, res) => {
    const { itemId, content } = req.body;
    const userId = req.user.userId;

    if (!itemId || !content) {
      return res.status(400).json({ error: "Fill in missing content" });
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          itemId,
          userId,
        },
      });

      res.json(comment);
    } catch (error) {
      console.error("Error while creating comment", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  deleteComment: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id,
        },
      });

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (comment.userId !== userId) {
        return res.status(404).json({ error: "No permission" });
      }

      await prisma.comment.delete({
        where: {
          id,
        },
      });

      res.json(comment);
    } catch (error) {
      console.error("Error while creating collection", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = CommentController;
