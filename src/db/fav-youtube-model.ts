import { Schema, model } from "mongoose";

export interface IFavYoutubeVediosSchema {
  title: string;
  decription: string;
  thumbnailUrl?: string;
  watched: boolean;
  youtuberName: string;
}

const favYoutubeVedioSchema = new Schema<IFavYoutubeVediosSchema>(
  {
    title: {
      type: String,
      required: true,
    },
    decription: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: false,
      default: "https://placehold.co/600x400",
    },
    watched: {
      type: Boolean,
      default: false,
      required: false,
    },
    youtuberName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const favYoutubeVediosModel = model(
  "fav-youtube-vedios",
  favYoutubeVedioSchema
);
export default favYoutubeVediosModel;
