const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  likeItem: async (req, res) => {
    const { itemId } = req.body;
    const userId = req.user.userId;

    if (!itemId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const likeExists = await prisma.like.findFirst({
        where: { itemId, userId },
      });

      if (likeExists) {
        return res.status(400).json({ error: "Already have done like" });
      }

      const like = await prisma.like.create({
        data: {
          itemId,
          userId,
        },
      });

      res.json(like);
    } catch (error) {
      console.error("Error while liking item", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  unlikeItem: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: "Already disliked" });
    }

    try {
      const likeExists = await prisma.like.findFirst({
        where: {
          itemId: id,
          userId,
        },
      });

      if (!likeExists) {
        return res.status(400).json({ error: "Unable to dislike" });
      }

      const like = await prisma.like.deleteMany({
        where: {
          itemId: id,
          userId,
        },
      });

      res.json(like);
    } catch (error) {
      console.error("Error while disliking item", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = LikeController;
