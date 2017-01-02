<template>
    <div class="date-items">
        <div class="numeric date-items-head">{{ date }}</div>
        <ul class="items">
            <li v-for="item of items" :key="item.id" @click="selectSelf(item.id)" :class="{selected: selected[item.id]}">
                <input type="checkbox" v-if="deleting" v-model="selected[item.id]">
                <div class="tag-list">
                    <span v-for="tag of item.tags">{{ tag }}</span>
                </div>
                <span class="numeric price">{{ item.price }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
    module.exports = {
        props: {
            date: String,
            items: Array,
            deleting: Boolean
        },
        data(){
            return {
                selected: {}
            }
        },
        methods: {
            selectSelf(id){
                if(this.deleting){
                    this.$set(this.selected, id, !this.selected[id]);
                }
            }
        },
        watch: {
            deleting(){
                this.selected = {};
            }
        }
    }
</script>