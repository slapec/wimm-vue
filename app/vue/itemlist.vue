<template>
    <div id="item-list" :class="{loading: loading}">
        <div v-if="loading" id="loader"></div>

        <div id="title">
            <div id="year-month">{{ yearMonth }}</div>

            <div class="button-group">
                <button id="edit" class="fa"
                        :class="{'fa-pencil': !editing, 'fa-times': editing, disabled: deleting}"
                        v-bind:disabled="deleting"
                        @click="editing = !editing">
                </button>
                <button id="delete" class="fa"
                        :class="{'fa-trash-o': !deleting, 'fa-times': deleting, disabled: editing}"
                        v-bind:disabled="editing"
                        @click="deleting = !deleting">
                </button>
            </div>

            <div class="h-fill"></div>

            <div class="button-group">
                <button id="previous-month" class="fa fa-chevron-left"
                        v-if="canNavigate"
                        @click="seekMonth(-1)">
                </button>
                <button id="next-month" class="fa fa-chevron-right"
                        v-if="canNavigate"
                        @click="seekMonth(1)">
                </button>

                <button id="delete-confirm" class="fa fa-check"
                        v-if="deleting"
                        @click="deleteSelected()">
                </button>
            </div>
        </div>

        <div id="date-items-list">
            <date-items v-for="dateItems of dates"
                        :key="dateItems.date"
                        :date="dateItems.date"
                        :items="dateItems.items"
                        :deleting="deleting"
                        :editing="editing"
                        @select="itemSelected">
            </date-items>
        </div>

        <div id="main-item-form">
            <item-form id="item-form-0" @submit="submit" :date="today" @datechanged="dateChanged" :disabled="submitting"></item-form>
            <button type="submit" form="item-form-0" class="fa fa-plus" v-bind:disabled="submitting"></span></button>
        </div>
    </div>
</template>

<script>
    let moment = require('moment');

    let io = require('../js/io');

    let DateItems = require('./dateitems.vue');
    let ItemForm = require('./itemform.vue');

    module.exports = {
        components: {
            'item-form': ItemForm,
            'date-items': DateItems,
        },
        created: function(){
            this.loadMonth(this.$route.params);
        },
        data(){
            return {
                loading: false,
                submitting: false,
                today: null,
                yearMonth: null,
                dates: [],
                deleting: false,
                editing: false,
                selected: new Set()
            }
        },
        methods: {
            loadMonth({year, month}){
                this.loading = true;

                io.items.loadMonth({year, month})
                .then(dates => {
                    dates.sort((left, right) => (left.date > right.date) - (left.date < right.date));
                    this.dates = dates;
                })
                .then(() => {
                    let yearMonth = moment().year(year).month(month).subtract(1, 'month');
                    this._yearMonth = yearMonth;
                    this.yearMonth = yearMonth.format('YYYY / MMMM');

                    let today = moment().format('YYYY-MM-DD');

                    if(yearMonth.format('YYYY-MM-DD') === today){
                        this.today = today;
                    }
                    else {
                        this.today = yearMonth.date(1).format('YYYY-MM-DD');
                    }
                })
                .then(() => {
                    let lastItem = document.querySelector('.date-items:last-child li:last-child');
                    if(lastItem){
                        lastItem.scrollIntoView();
                    }

                    this.loading = false;
                    this.deleting = false;
                    this.editing = false;
                    this.selected = new Set();
                });
            },
            submit(formData, callback){
                this.submitting = true;

                io.items.add(formData)
                .then(item => {
                    let [date] = this.dates.filter(d => d.date === item.date);

                    if(date){
                        date.items.push(item.item);
                    }
                    else {
                        this.dates.push({
                            date: item.date,
                            items: [item.item]
                        });
                        this.dates.sort((left, right) => (left.date > right.date) - (left.date < right.date));
                    }

                    this.$nextTick(() => document.getElementById(`item-${item.item.id}`).scrollIntoView(false));
                })
                .then(() => {
                    callback();
                    this.submitting = false;
                });
            },
            seekMonth(direction){
                let nextMonth = null;

                if(direction > 0){
                    nextMonth = this._yearMonth.add(1, 'month');
                }
                else if(direction < 0){
                    nextMonth = this._yearMonth.subtract(1, 'month');
                }
                else {
                    throw new Error('direction must be +1 or -1');
                }

                this.$router.push({name: 'item:list:year-month', params: {
                    year: nextMonth.format('YYYY'),
                    month: nextMonth.format('MM')
                }});
            },
            dateChanged(date){
                this.today = date;
            },
            itemSelected(id, isSelected){
                let selected = this.selected;

                if(isSelected){
                    selected.add(id);
                }
                else {
                    selected.delete(id);
                }
            },
            deleteSelected(){
                let toDelete = Array.from(this.selected);

                this.loading = true;
                io.items.remove(toDelete)
                .then(() => {
                    for(let date of this.dates){
                        date.items = date.items.filter(d => !this.selected.has(d.id));
                    }

                    this.dates = this.dates.filter(d => d.items.length > 0);

                    this.selected = new Set();
                    this.loading = false;
                })
            }
        },
        computed: {
            canNavigate(){
                return !this.deleting && !this.editing;
            }
        },
        watch: {
            $route(route){
                this.loadMonth(route.params);
            },
            deleting(value){
                if(!value){
                    this.selected = new Set();
                }
            }
        }
    };
</script>