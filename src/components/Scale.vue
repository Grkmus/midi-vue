<template>
    <div class="container">
      <div class="row">
        <key :velocity=C ></key>
        <key :velocity=Db ></key>
        <key :velocity=D ></key>
        <key :velocity=Eb ></key>
        <key :velocity=E ></key>
        <key :velocity=F ></key>
        <key :velocity=Gb ></key>
        <key :velocity=G ></key>
        <key :velocity=Ab ></key>
        <key :velocity=A ></key>
        <key :velocity=Bb ></key>
        <key :velocity=B ></key>
      </div>
    </div>
</template>

<script>
import Key from './Key.vue';

export default {
  name: 'Scale',
  components: {
    Key,
  },
  data() {
    return {
      C: null,
      Db: null,
      D: null,
      Eb: null,
      E: null,
      F: null,
      Gb: null,
      G: null,
      Ab: null,
      A: null,
      Bb: null,
      B: null,
    };
  },
  created() {
    this.$root.$on('noteon', (e) => {
      console.log(e);
      this.play(e.noteName, e.velocity);
    });
  },
  methods: {
    play(note, velocity) {
      const asLetter = note?.slice(0, -1);
      this[asLetter] = velocity;
    },
  },
};
</script>
