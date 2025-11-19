<template>
  <q-card class="kpi-card tata-card" :class="cardClass">
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-overline text-grey-8" style="letter-spacing: 1px; font-weight: 600">
            {{ title }}
          </div>
          <div class="text-h4 text-weight-bold q-mt-xs text-black">
            {{ formattedValue }}
          </div>
          <div v-if="subtitle" class="text-caption text-grey-7 q-mt-xs">
            {{ subtitle }}
          </div>
        </div>
        <div class="col-auto">
          <q-icon :name="icon" size="56px" :color="iconColor" class="kpi-icon" />
        </div>
      </div>
    </q-card-section>

    <q-linear-progress
      v-if="showProgress"
      :value="progressValue"
      :color="progressColor"
      size="4px"
      class="q-mt-sm"
    />

    <q-card-section v-if="description" class="q-pt-none">
      <div class="text-caption text-grey-7">
        {{ description }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'assessment',
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  suffix: {
    type: String,
    default: '%',
  },
  showProgress: {
    type: Boolean,
    default: true,
  },
  threshold: {
    type: Number,
    default: 80,
  },
  isInteger: {
    type: Boolean,
    default: false,
  },
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    if (props.isInteger) {
      return Math.round(props.value) + props.suffix
    }
    return props.value.toFixed(2) + props.suffix
  }
  return props.value
})

const progressValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value / 100
  }
  return 0
})

const progressColor = computed(() => {
  if (typeof props.value === 'number') {
    if (props.value >= props.threshold) return 'grey-8'
    if (props.value >= props.threshold - 10) return 'grey-6'
    return 'grey-9'
  }
  return 'grey-7'
})

const cardClass = computed(() => {
  if (typeof props.value === 'number') {
    if (props.value >= props.threshold) return 'kpi-success'
    if (props.value >= props.threshold - 10) return 'kpi-warning'
    return 'kpi-danger'
  }
  return ''
})
</script>

<style scoped lang="scss">
.kpi-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

.kpi-success {
  border-left: 3px solid #424242;
  background: linear-gradient(to right, rgba(66, 66, 66, 0.03), transparent);
}

.kpi-warning {
  border-left: 3px solid #757575;
  background: linear-gradient(to right, rgba(117, 117, 117, 0.03), transparent);
}

.kpi-danger {
  border-left: 3px solid #212121;
  background: linear-gradient(to right, rgba(33, 33, 33, 0.03), transparent);
}

.kpi-icon {
  opacity: 0.15;
}
</style>
