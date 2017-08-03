import io from '@/services/io';

export default {
  namespaced: true,
  getters: {
    autocomplete: state => term => io.tags.autocomplete(term)
  }
}
