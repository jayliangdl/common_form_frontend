<!-- <template>
  <div v-if="visible">
    <label v-for="option in options" :key="option.value">
      <input
        type="checkbox"
        :value="option.value"
        v-model="checkedValues"
        @change="updateValueEvent"
      />{{ option.label }}
    </label>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { EventBus } from '../eventBus.js';

export default {
  props: ['id', 'properties'],
  data() {
    return {
      options: [], // 可选值列表
      visible: true, // 控制组件的可见性
      checkedValues: {}, // 选中的值，适用于单选情况下，可以只允许一个值被选中
    };
  },
  computed: {
    ...mapGetters(['getValue']), // 从vuex中获取用户已从表单中填写的值
  },
  watch: {
    checkedValues(newValue) {
      // 当选中值变化时，更新到Vuex中，并且发出ControlChanged事件
      this.updateValue({ id: this.id, value: newValue });
      console.log(`ControlChanged:${JSON.stringify({ id: this.id, value: newValue })}`);
      EventBus.$emit('ControlChanged', { id: this.id, value: newValue });
    },
  },
  created() {
    // 组件创建时，初始化数据并监听需要的事件
    this.initFromProperties();
    this.initValueFromProperties();

    EventBus.$on('GoingtoChangeCheckboxValue', ({ id, value }) => {
      if (id === this.id) {
        this.checkedValues = value; // 更新选中的值，这里假设是单选，因此使用数组第一个值
      }
    });

    EventBus.$on('GoingtoChangeCheckboxOptions', ({ id, options }) => {
      if (id === this.id) {
        this.options = options; // 更新可选值列表
      }
    });

    EventBus.$on('GoingtoHideCheckboxComponent', ({ id, shouldBeVisible }) => {
      if (id === this.id) {
        this.visible = shouldBeVisible; // 更新组件的可见性
      }
    });
  },
  beforeDestroy() {
    // 在组件销毁前取消事件监听，避免内存泄露
    EventBus.$off('GoingtoChangeCheckboxValue');
    EventBus.$off('GoingtoChangeCheckboxOptions');
    EventBus.$off('GoingtoHideCheckboxComponent');
  },
  methods: {
    ...mapActions(['updateValue']), // 对应 Vuex actions 中的 updateValue
    updateValueEvent(event) {
      this.value = event.target.value;  //它会触发value的set方法
    },
    initFromProperties() {
      // 根据传入的properties初始化组件的options
      if (this.properties.options) {
        this.options = this.properties.options;
      }
    },
    initValueFromProperties() {
      // 根据传入的properties初始化组件的选中值
      const initValue = this.getValue(this.id);
      if (initValue !== undefined) {
        this.checkedValues = initValue; // 初始化选中的值，假设单选
      }
    },
  },
};
</script>
 -->


 <template>
  <div v-if="visible">
    <label v-for="option in options" :key="option.value">
      <input
        type="checkbox"
        :value="option.value"
        v-model="checkedValues"
        @change="updateValueEvent"
      />{{ option.label }}
    </label>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { EventBus } from '../eventBus.js';

export default {
  props: ['id', 'properties'],
  data() {
    return {
      options: [], // 可选值列表
      visible: true, // 控制组件的可见性
      checkedValues: [], // 选中的值，适用于单选情况下，可以只允许一个值被选中
    };
  },
  computed: {
    ...mapGetters(['getValue']), // 从vuex中获取用户已从表单中填写的值
  },
  watch: {
    checkedValues(newValue) {
      // 当选中值变化时，更新到Vuex中，并且发出ControlChanged事件
      this.updateValue({ id: this.id, value: newValue });
      EventBus.$emit('ControlChanged', { id: this.id, value: newValue });
    },
  },
  created() {
    // 组件创建时，初始化数据并监听需要的事件
    this.initFromProperties();
    this.initValueFromProperties();

    EventBus.$on('GoingtoChangeCheckboxValue', ({ id, value }) => {
      if (id === this.id) {
        this.checkedValues = [value]; // 更新选中的值，这里假设是单选，因此使用数组第一个值
      }
    });

    EventBus.$on('GoingtoChangeCheckboxOptions', ({ id, options }) => {
      if (id === this.id) {
        this.options = options; // 更新可选值列表
      }
    });

    EventBus.$on('GoingtoHideCheckboxComponent', ({ id, shouldBeVisible }) => {
      if (id === this.id) {
        this.visible = shouldBeVisible; // 更新组件的可见性
      }
    });
  },
  beforeDestroy() {
    // 在组件销毁前取消事件监听，避免内存泄露
    EventBus.$off('GoingtoChangeCheckboxValue');
    EventBus.$off('GoingtoChangeCheckboxOptions');
    EventBus.$off('GoingtoHideCheckboxComponent');
  },
  methods: {
    ...mapActions(['updateValue']), // 对应 Vuex actions 中的 updateValue

    updateValueEvent() {
      // 由于在watch中已经处理了value的更新逻辑，这里不需要额外的逻辑
    },
    initFromProperties() {
      // 根据传入的properties初始化组件的options
      if (this.properties.options) {
        this.options = this.properties.options;
      }
    },
    initValueFromProperties() {
      // 根据传入的properties初始化组件的选中值
      const initValue = this.getValue(this.id);
      if (initValue !== undefined) {
        this.checkedValues = [initValue]; // 初始化选中的值，假设单选
      }
    },
  },
};
</script>
