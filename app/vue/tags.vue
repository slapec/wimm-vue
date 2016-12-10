<template>
    <ul class="tags" :class="{conflict:conflict, empty: tagList}" @click="focusInput">
        <li v-for="tag of tagList" class="tag" @click="remove($event, tag)" :key="tag">
            {{ tag }}
        </li>

        <li class="tag-input">
            <input v-model="currentTag" @keydown="keydown" @blur="add" ref="tagInput">
            <ul v-if="choiceListVisible">
                <li v-for="(tag, index) of choiceList"
                    :class="{'tag-choice-selected': index === selectedIndex}"
                    @mousedown="deferBlur = true"
                    @mouseup="add($event, tag)"
                    @mouseover="selectedIndex = index">
                    {{ tag }}
                </li>
            </ul>
        </li>
    </ul>
</template>

<script>
    let UNDEFINED = -1;
    let DELIMITERS = new Set(['Tab', 'Enter']);
    let CHOICE_WHITELIST = new Set(['Backspace', 'Delete']);

    module.exports = {
        props: {
            tags: {
                type: Array,
                required: false,
                default: () => []
            },
            choices: {
                type: [Function, Array],
                required: false,
                default: () => []
            }
        },
        data: function(){
            return {
                tagList: this.tags,
                currentTag: '',
                conflict: false,

                choiceList: [],
                choiceListVisible: false,
                selectedIndex: UNDEFINED,

                deferBlur: false
            };
        },
        methods: {
            keydown: function(e){
                if(e.key === 'Backspace'){
                    if(!this.currentTag){
                        e.preventDefault();
                        this.currentTag = this.tagList.pop();
                        this.conflict = false;
                    }
                }
                else if(DELIMITERS.has(e.key)){
                    e.preventDefault();

                    this.choiceListVisible = false;
                    this.add();
                    this.focusInput();
                }

                if(this.choiceListVisible){
                    if(e.key === 'ArrowDown'){
                        e.preventDefault();

                        this.selectedIndex = (this.selectedIndex + 1) % this.choiceList.length;
                        this.currentTag = this.choiceList[this.selectedIndex];
                    }
                    else if(e.key === 'ArrowUp'){
                        e.preventDefault();

                        let n = this.choiceList.length;
                        this.selectedIndex = (((this.selectedIndex - 1) % n) + n ) % n;
                        this.currentTag = this.choiceList[this.selectedIndex];
                    }
                    else if(e.key.length === 1 || CHOICE_WHITELIST.has(e.key)){
                        this.resolveRequired = true;
                    }
                }
                else {
                    this.resolveRequired = true;
                }
            },
            add: function(e, tag){
                if(tag){
                    this.currentTag = tag;
                    this.deferBlur = false;
                }
                if(!this.deferBlur){
                    this.conflict = false;
                    this.choiceListVisible = false;

                    if(this.currentTag && this.currentTag.length > 0){
                        let tag = this.currentTag.trim();
                        if(tag.length > 0){
                            if(this.tagList.indexOf(tag) === UNDEFINED){
                                this.tagList.push(tag);
                                this.currentTag = '';
                            }
                            else {
                                this.conflict = true;
                            }
                        }
                    }
                }

                this.deferBlur = false;
            },
            remove: function(e, tag){
                e.stopPropagation();

                this.tagList.splice(this.tagList.indexOf(tag), 1);
                this.conflict = false;
            },
            focusInput: function(){
                let tagInput = this.$refs.tagInput;

                if(tagInput){
                    tagInput.focus();
                }
            },
            resolveChoices: function(){
                try {
                    var choices = this.choices(this.currentTag);
                }
                catch (e) {
                    return;
                }

                if(this.choices){
                    Promise.resolve(choices)
                    .then(value => {
                        this.choiceList = value;
                        this.selectedIndex = UNDEFINED;
                        this.choiceListVisible = this.choiceList.length > 0;
                    });
                }
            }
        },
        created: function(){
            this.resolveRequired = false;
        },
        updated: function(){
            let tagInput = this.$refs.tagInput;

            if(tagInput){
                tagInput.style.width = '2px';
                tagInput.style.width = `${tagInput.scrollWidth + 2}px`
            }

            if(this.resolveRequired){
                this.resolveChoices();
                this.resolveRequired = false;
            }
        }
    }
</script>