<template>
  <div v-bind:class="{ pressed: currentVelocity}" class="white-key" >
  </div>
</template>

<script>
export default {
  name: 'WhiteKey',
  props: {
    velocity: Number,
    note: String,
  },
  data() {
    return {
      currentVelocity: 0,
    };
  },
  methods: {
    pressKey(velocity) {
      this.currentVelocity = velocity;
    },
    releaseKey() {
      this.currentVelocity = 0;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.pressed {
  background-color: orangered;
}
</style>
