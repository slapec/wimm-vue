<template>
    <div id="item-list" :class="{loading: loading}">
        <div v-if="loading" id="loader"></div>

        <div id="title">
            <div id="year-month">{{ yearMonth }}</div>
            <button id="edit" class="fa fa-pencil"></button>
            <button id="delete" class="fa fa-trash-o" @click="deleting = !deleting"></button>
            <div class="h-fill"></div>
            <button v-if="!deleting" id="previous-month" class="fa fa-chevron-left" @click="seekMonth(-1)"></button>
            <button v-if="!deleting" id="next-month" class="fa fa-chevron-right" @click="seekMonth(1)"></button>

            <button v-if="deleting" id="delete-cancel" class="fa fa-close"></button>
            <button v-if="deleting" id="delete-confirm" class="fa fa-check"></button>
        </div>

        <div id="date-items-list">
            <date-items v-for="dateItems of dates" :key="dateItems.date" :date="dateItems.date" :items="dateItems.items" :deleting="deleting" @select="itemSelected"></date-items>
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
                selected: {}
            }
        },
        methods: {
            loadMonth({year, month}){
                this.loading = true;

                io.items.loadMonth({year, month})
                .then(dates => {
                    dates.sort((left, right) => left.date <= right.date);
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
                    this.loading = false;
                });
            },
            submit(formData, callback){
                this.submitting = true;

                io.items.add(formData)
                .then(item => {
                    let [date] = this.dates.filter(d => d.date === item.date);

                    if(date){
                        date.items.unshift(item.item);
                    }
                    else {
                        this.dates.push({
                            date: item.date,
                            items: [item.item]
                        });
                        this.dates.sort((l, r) => l.date < r.date);
                    }
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
            itemSelected(item){
                console.log(item.id);
            }
        },
        watch: {
            $route(route){
                this.loadMonth(route.params);
            }
        }
    };
</script>