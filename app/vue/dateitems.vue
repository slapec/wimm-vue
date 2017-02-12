<template>
    <div class="date-items">
        <div class="numeric date-items-head">{{ date }}</div>
        <ul class="items">
            <li v-for="item of items"
                :key="item.id" :id="'item-' + item.id"
                :class="{selected: selected[item.id], editing: editing, submitting: submitting[item.id]}"
                @click="selectSelf(item.id)">

                <div class="item">
                    <template v-if="editors[item.id]">
                        <item-form :id="'item-form-' + item.id"
                                   :tags="item.tags"
                                   :price="item.price"
                                   :date="item.date"
                                   :disabled="submitting[item.id]"
                                   @dateChanged="dateChanged(item, $event)"
                                   @submit="submit(item, $event)"></item-form>
                    </template>
                    <template v-else>
                        <div class="tag-list">
                            <span v-for="tag of item.tags">{{ tag }}</span>
                        </div>
                        <span class="numeric price"
                              :class="{positive: item.price > 0}">
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
                        @click="editSelf(item.id, $event)"></button>

                    <button type="submit"
                            class="i i-save"
                            v-if="editors[item.id]"
                            :form="'item-form-' + item.id"
                            :disabled="submitting[item.id]"
                    ></button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    let io = require('./../js/io');
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
                editors: {},
                submitting: {}
            }
        },
        methods: {
            selectSelf(id){
                if(this.deleting){
                    let isSelected = !this.selected[id];

                    if(isSelected){
                        this.$set(this.selected, id, true);
                    }
                    else {
                        this.$delete(this.selected, id);
                    }

                    this.$emit('select', id, isSelected)
                }
                else if(this.editing){
                    if(!this.editors[id]){
                        this.$set(this.editors, id, true);
                    }
                }
            },
            editSelf(id, e){
                if(this.editing){
                    e.stopPropagation();

                    if(this.editors[id]){
                        this.$delete(this.editors, id);
                    }
                    else {
                        this.$set(this.editors, id, true);
                    }
                }
            },
            submit(oldItem, {item, callback}){
                let id = oldItem.id;

                this.$set(this.submitting, id, true);

                io.items.edit(id, item)
                .then(() => {
                    item.id = id;
                    this.$emit('itemChanged', {
                        item,
                        index: this.items.indexOf(oldItem)
                    });
                })
                .then(() => {
                    this.$delete(this.submitting, id);
                    this.$delete(this.editors, id);
                });
            },
            dateChanged(item, date){
                item.date = date;
            },
            autocomplete: io.autocomplete
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