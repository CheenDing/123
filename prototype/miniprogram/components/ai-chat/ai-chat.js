import { getAiChat } from '../../utils/api';

function wrapMessage(msg) {
  return {
    role: msg.role,
    content: msg.content,
    lines: String(msg.content || '').split('\n'),
  };
}

Component({
  properties: {
    profile: { type: Object, value: null },
    recommendations: { type: Object, value: null },
  },

  data: {
    messages: [],
    input: '',
    loading: false,
    suggestedQuestions: [
      '我的志愿方案合理吗？',
      '计算机专业就业前景如何？',
      '985和211怎么选？',
      '哪些专业是天坑？',
    ],
  },

  methods: {
    sendMessage(e) {
      const text = e ? e.currentTarget.dataset.text : this.data.input;
      if (!text || !text.trim() || this.data.loading) return;

      const userMessage = wrapMessage({ role: 'user', content: text });
      const messages = [...this.data.messages, userMessage];
      this.setData({ messages, input: '', loading: true });

      const profile = this.properties.profile || {};
      const recommendations = this.properties.recommendations;

      getAiChat(profile, recommendations, text, this.data.messages)
        .then((data) => {
          const replyMsg = wrapMessage({
            role: 'assistant',
            content: data.ok ? data.reply : ('抱歉，回复生成失败：' + (data.error || '未知错误')),
          });
          this.setData({
            messages: [...this.data.messages, replyMsg],
            loading: false,
          });
        })
        .catch(() => {
          const errMsg = wrapMessage({ role: 'assistant', content: '网络错误，请稍后重试' });
          this.setData({
            messages: [...this.data.messages, errMsg],
            loading: false,
          });
        });
    },

    onInput(e) {
      this.setData({ input: e.detail.value });
    },

    onClose() {
      this.triggerEvent('close');
    },
  },
});
