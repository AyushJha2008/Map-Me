import mongoose, { Schema } from "mongoose"
import mongoAggregate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema(
    {
        video:{
            type: String,
            required:true,
        },
        thumbnai:{
            type: String,
            required: true,
        },
        title:{
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: true,
        },
        duration:{
            type: Number, //cloudnary
            required:true
        },
        views:{
            type:Number,
            default: 0,
        },
        ispublished:{
            type: Boolean,
            default: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "user"
        }
    },
    {timestamps:true})

    videoSchema.plugin(mongoAggregate)
export const Video = Schema.model("Video", videoSchema);
