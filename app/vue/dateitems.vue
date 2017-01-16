<template>
    <div class="date-items">
        <div class="numeric date-items-head">{{ date }}</div>
        <ul class="items">
            <li v-for="item of items"
                :key="item.id" :id="'item-' + item.id"
                :class="{selected: selected[item.id], editing: editing}"
                @click="selectSelf(item.id)">

                <input type="checkbox" v-if="deleting" v-model="selected[item.id]">

                <template v-if="editing">
                    <tags :choices="autocomplete" :tags="item.tags"></tags>
                    <input v-if="editing" type="number" v-model="item.price" class="price numeric" step="0.01" autocomplete="off" placeholder="Price">
                    <button class="fa fa-save"></button>
                </template>
                <template v-else>
                    <div class="tag-list">
                        <span v-for="tag of item.tags">{{ tag }}</span>
                    </div>
                    <span class="numeric price"
                          v-bind:class="{positive: item.price > 0}">
                        {{ item.price | money }}
                    </span>
                </template>
            </li>
        </ul>
    </div>
</template>

<script>
    let Tags = require('./tags.vue');

    let formatter = Intl.NumberFormat();

    module.exports = {
        components: {
            Tags: Tags
        },
        props: {
            date: String,
            items: Array,
            deleting: Boolean,
            editing: Boolean
        },
        data(){
            return {
                selected: {}
            }
        },
        methods: {
            selectSelf(id){
                if(this.deleting){
                    let isSelected = !this.selected[id];
                    this.$set(this.selected, id, isSelected);
                    this.$emit('select', id, isSelected)
                }
            },
            autocomplete: require('./../js/io').autocomplete
        },
        watch: {
            deleting(){
                this.selected = {};
            }
        },
        filters: {
            money(value){
                value = formatter.format(value);

                if(value[0] !== '-'){
                    value = '+' + value;
                }

                return value;
            }
        }
    }
</script>