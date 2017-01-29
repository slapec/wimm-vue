<template>
    <div class="date-items">
        <div class="numeric date-items-head">{{ date }}</div>
        <ul class="items">
            <li v-for="item of items"
                :key="item.id" :id="'item-' + item.id"
                :class="{selected: selected[item.id], editing: editing}"
                @click="selectSelf(item.id)">

                <div class="item">
                    <template v-if="editors[item.id]">
                        <item-form :id="'item-form-' + item.id"
                                   :init-tags="item.tags"
                                   :init-price="item.price"
                                   :date="date"
                                   @submit="submit(item.id, $event)"></item-form>
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
                </div>

                <div class="button-group" v-if="deleting || editing">
                    <button class="i selected"
                      v-if="deleting"
                      :class="{'i-check_box_outline_blank': !selected[item.id], 'i-check_box': selected[item.id]}"></button>

                    <button class="i"
                        :class="{'i-mode_edit': !editors[item.id], 'i-close': editors[item.id]}"
                        v-if="editing"
                        @click="editSelf(item.id)"></button>

                    <button type="submit"
                            class="i i-save"
                            v-if="editors[item.id]"
                            :form="'item-form-' + item.id"></button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    let ItemForm = require('./itemform.vue');

    let formatter = Intl.NumberFormat();

    module.exports = {
        components: {
            'item-form': ItemForm,
        },
        props: {
            date: String,
            items: Array,
            deleting: Boolean,
            editing: Boolean
        },
        data(){
            return {
                selected: {},
                editors: {}
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
            editSelf(id){
                if(this.editing){
                    let hasEditor = !this.editors[id];
                    this.$set(this.editors, id, hasEditor);
                }
            },
            submit(){
                console.log(arguments);
            },

            autocomplete: require('./../js/io').autocomplete
        },
        watch: {
            deleting(){
                this.selected = {};
            },
            editing(){
                this.editors = {};
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