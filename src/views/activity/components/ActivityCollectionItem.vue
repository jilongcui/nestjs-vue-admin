<template>
    <div class="root">
        <div class="remove" @click="$emit('remove')">
            <i class="el-icon-circle-close"></i>
        </div>
        <img class="cover" :src="cover" />
        <div class="content">
            <p class="name">{{ item.name }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "ActivityCollectionItem",
    props: {
        item: {
            type: Object,
            default: {},
        },
    },

    computed: {
        cover() {
            if (this.item && typeof this.item === "object" && this.item.images) {
                return this.item.images[0];
            }
            return "";
        },
    },
};
</script>

<style lang="scss" scoped>
.root {
    width: 100%;
    max-width: 256px;
    border: solid 1px #ccc;
    border-radius: 8px;
    overflow: hidden;
    position: relative;

    .remove {
        position: absolute;
        top: 8px;
        right: 8px;
        cursor: pointer;

        i {
            font-size: 28px;
            color: #CCC;
            transition: color 200ms ease;

            &:hover {
                color: red
            }
        }
    }

    .cover {
        width: 100%;
        height: 200px;
        object-fit: cover;
        max-width: 100%;
        display: block;
    }

    .content {
        padding: 12px;

        .name {
            margin: 0px;
            line-height: 1.5;
        }
    }
}
</style>>