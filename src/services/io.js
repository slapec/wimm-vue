class BaseIONode {
  constructor(io){
    this.io = io
  }

  get root(){
    return this.io.root
  }

  get headers(){
    return this.io.headers
  }
}

class Stats extends BaseIONode {
  totalSum({dateFrom, dateTo, interval}){
    return fetch(`${this.root}/total_sum/?from=${dateFrom}&to=${dateTo}&interval=${interval}`, {
      credentials: 'same-origin',
    })
      .then(v => v.json())
  }

  tagSum({dateFrom, dateTo, tagCount, negativeFirst}){
    return fetch(`${this.root}/tag_sum/?from=${dateFrom}&to=${dateTo}&tagCount=${tagCount}&negativeFirst=${Number(negativeFirst)}`, {
      credentials: 'same-origin',
    })
      .then(v => v.json())
  }
}

class Items extends BaseIONode {
  fetchMonth({year, month}){
    return fetch(`${this.root}/items/?year=${year}&month=${month}`, {
      credentials: 'same-origin'
    })
      .then(v => v.json())
      .then(data =>{
        data.forEach(date =>{
          date.items.forEach(item =>{
            item.date = date.date
          });
        });

        return data
      });
  }

  add(item){
    if(item){
      return fetch(`${this.root}/items/`, {
        method: 'POST',
        credentials: 'same-origin',
        ...this.io.toJson(item)
      })
        .then(v => v.json())
        .then(data =>{
          data.item.date = data.date;

          return data
        })
    }
    else {
      return Promise.resolve()
    }
  }

  remove(items){
    if(items.length){
      return fetch(`${this.root}/items/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        ...this.io.toJson({'items': items})
      })
        .then(v => v.json())
    }
    else {
      return Promise.resolve()
    }
  }

  edit(item){
    return fetch(`${this.root}/items/${item.id}/`, {
      method: 'PATCH',
      credentials: 'same-origin',
      ...this.io.toJson(item)
    })
      .then(v => v.json())
  }
}

class Tags extends BaseIONode {
  autocomplete(term){
    if(term){
      return fetch(`${this.root}/autocomplete/?term=${term}`, {
        credentials: 'same-origin'
      })
        .then(v => v.json())
    }
    else {
      return []
    }
  }
}

class IO {
  constructor(){
    this.headers = null;
    this.root = '';

    this.items = null;
    this.tags = null;
    this.stats = null;

    this.initialized = fetch('/api/settings')
      .then(v => v.json())
      .then(data =>{
        this.root = `${data.root}/api`;

        this.headers = new Headers({'X-CSRFToken': data.csrftoken});

        this.items = new Items(this);
        this.tags = new Tags(this);
        this.stats = new Stats(this);
      })
  }

  toJson(data){
    return {
      body: new Blob([JSON.stringify(data)], {type: 'application/json'}),
      headers: this.headers
    }
  }
}

export default new IO();
