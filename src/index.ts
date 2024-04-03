import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import { streamText } from "hono/streaming";
import "dotenv/config";

import dbConnect from "./db/connect";
import favYoutubeVediosModel from "./db/fav-youtube-model";
import { isValidObjectId } from "mongoose";

const app = new Hono();

// middlewares
app.use(poweredBy());
app.use(logger());

dbConnect()
  .then(() => {
    // GET LIST
    app.get("/", async (c) => {
      const documents = await favYoutubeVediosModel.find();
      return c.json(
        documents.map((d) => d.toObject()),
        200
      );
    });

    // CREATE document
    app.post("/", async (c) => {
      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      const favYoutubesObj = new favYoutubeVediosModel(formData);
      try {
        const document = await favYoutubesObj.save();

        return c.json(document.toObject(), 201);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });

    // View Document By Id
    app.get("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await favYoutubeVediosModel.findById(id);

      if (!document) return c.json("Document not Found", 404);

      return c.json(document.toObject(), 200);
    });

    app.get("/d/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await favYoutubeVediosModel.findById(id);

      if (!document) return c.json("Document not Found", 404);

      return streamText(c, async (stream) => {
        stream.onAbort(() => {
          console.log("Aborted");
        });

        for (let i = 0; i < document.decription.length; i++) {
          await stream.write(document.decription[i]);
          await stream.sleep(1000);
        }
      });
    });

    app.patch("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await favYoutubeVediosModel.findById(id);

      if (!document) return c.json("Document not Found", 404);

      const formData = await c.req.json();
      if (formData.thumbnailUrl) delete formData.thumbnailUrl;

      try {
        const updatedDocument = await favYoutubeVediosModel.findByIdAndUpdate(
          id,
          formData,
          {
            new: true,
          }
        );
        return c.json(updatedDocument?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });

    // Delete Req
    app.delete("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await favYoutubeVediosModel.findById(id);

      if (!document) return c.json("Document not Found", 404);

      const formData = await c.req.json();
      if (formData.thumbnailUrl) delete formData.thumbnailUrl;
      try {
        const deletedDocument = await favYoutubeVediosModel.findByIdAndDelete(
          id
        );
        return c.json(deletedDocument?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });
  })
  .catch((err) => {
    app.get("/*", (c) => {
      return c.text(`Failed to connect to mongoDB: ${err.message}`);
    });
  });

app.onError((err, c) => {
  console.log("Error");
  return c.text(`App Error : ${err.message}`);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
