import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { stream, streamText, streamSSE } from "hono/streaming";

const app = new Hono();

let vedios = [];

app.get("/", (c) => {
  return c.json(vedios);
});

app.post("/vedio", async (c) => {
  const { vedioName, chanelName, duration } = await c.req.json();
  const newVedio = {
    id: uuidv4(),
    vedioName,
    chanelName,
    duration,
  };
  vedios.push(newVedio);
  return c.json(newVedio);
});

// get all the vedios (stream)
app.get("/vedios", (c) => {
  return streamText(c, async (stream) => {
    for (const vedio of vedios) {
      await stream.writeln(JSON.stringify(vedio));
      await stream.sleep(1000); // just to demo the streaming
    }
  });
});

app.get("/vedio/:id", (c) => {
  const { id } = c.req.param();
  const vedio = vedios.find((vedio) => vedio.id === id);
  if (!vedio) {
    return c.json(({ message: "Vedio is not Found" }, 404));
  }
  return c.json(vedio);
});

app.put("/vedio/:id", async (c) => {
  const { id } = c.req.param();
  const index = vedios.find((vedio) => vedio.id === id);
  if (index === -1) {
    return c.json(({ message: "Vedio is not Found" }, 404));
  }
  const { vedioName, chanelName, duration } = await c.req.json();
  vedios[index] = { ...vedios[index], vedioName, chanelName, duration };
  return c.json(vedios[index]);
});

app.delete("/vedio/:id", (c) => {
  const { id } = c.req.param();
  if (!id) {
    return c.json(({ message: "Vedio is not Found" }, 404));
  }
  vedios = vedios.filter((vedio) => vedio.id === id);
  return c.json({ message: "Vedio is Deleted" });
});
app.delete("/vedios", (c) => {
  vedios = [];
  return c.json({ message: "All Vedios is Deleted" });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
