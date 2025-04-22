<template>
  <div class="messenger-container">
    <!-- Mobile Menu Toggle -->
    <button v-if="isMobileView" class="mobile-toggle" @click="toggleSidebar">
      <i class="material-icons">{{ showSidebar ? 'close' : 'menu' }}</i>
    </button>

    <!-- Sidebar -->
    <div class="messenger-sidebar" :class="{ 'active': showSidebar }">
      <div class="sidebar-header">
        <h3><span class="primary-text">Messages</span></h3>
        <div class="header-actions">
          <button class="action-button">
            <i class="material-icons">more_horiz</i>
          </button>
        </div>
      </div>

      <div class="search-box">
        <i class="material-icons">search</i>
        <input type="text" placeholder="Search conversations" />
      </div>

      <div class="chat-list">
        <div
          v-for="chat in chatHistory"
          :key="chat.user.id"
          :class="[
            'chat-item',
            { 'active': chat.user.id === selectedReceiverId },
            { 'unread': chat.lastMessage && !chat.lastMessage.read }
          ]"
          @click="selectUser(chat.user.id)"
        >
          <div class="chat-avatar" :style="{ backgroundColor: getAvatarColor(chat.user.id) }">
            {{ getInitials(chat.user.firstName, chat.user.lastName) }}
            <span class="status-indicator" :class="{ 'online': true }"></span>
          </div>
          <div class="chat-info">
            <div class="chat-name">{{ chat.user.firstName }} {{ chat.user.lastName }}</div>
            <div class="chat-preview" v-if="chat.lastMessage">
              {{ truncateMessage(chat.lastMessage.content) }}
              <span class="chat-time">· {{ formatTimeShort(chat.lastMessage.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="messenger-main" v-if="selectedReceiverId">
      <div class="chat-header">
        <div class="chat-user-info">
          <button v-if="isMobileView" class="back-button" @click="toggleSidebar">
            <i class="material-icons">arrow_back</i>
          </button>
          <div class="chat-avatar" :style="{ backgroundColor: getAvatarColor(selectedReceiverId) }">
            {{ selectedUserInitials }}
            <span class="status-indicator online"></span>
          </div>
          <div class="user-details">
            <h3>{{ selectedUserName }}</h3>
            <span class="online-status">Active Now</span>
          </div>
        </div>
        <div class="header-actions">
          <button v-if="isCreator" class="action-button primary" @click="togglePaymentDrawer">
            <i class="material-icons">payments</i>
          </button>
          <button class="action-button hide-on-mobile">
            <i class="material-icons">phone</i>
          </button>
          <button class="action-button hide-on-mobile">
            <i class="material-icons">videocam</i>
          </button>
          <button class="action-button">
            <i class="material-icons">info</i>
          </button>
        </div>
      </div>

      <div class="chat-messages" ref="messageContainer">
        <div
          v-for="(msg, index) in groupedMessages"
          :key="index"
          class="message-group"
        >
          <div class="message-date"><span>{{ formatDate(msg.date) }}</span></div>
          <div
            v-for="message in msg.messages"
            :key="message.id"
            :class="[
              'message',
              message.senderId === currentUserId ? 'message-sent' : 'message-received'
            ]"
          >
            <div 
              :class="[
                'message-bubble',
                isPaymentMessage(message.content) ? 'payment-bubble' : '',
                message.senderId === currentUserId ? 'sent' : 'received'
              ]"
              @click="handleMessageClick(message.content)"
            >
              <template v-if="isPaymentMessage(message.content)">
                <div class="payment-content">
                  <div class="payment-icon">💰</div>
                  <div class="payment-info">
                    <div class="payment-amount">₱{{ formatAmount(getPaymentDetails(message.content).amount) }}</div>
                    <div class="payment-description">{{ getPaymentDetails(message.content).description }}</div>
                    <div class="payment-action">Click to pay</div>
                  </div>
                </div>
              </template>
              <template v-else>
                {{ message.content }}
              </template>
            </div>
            <div class="message-time">{{ formatTime(message.createdAt) }}</div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <div class="input-actions">
          <button class="action-button hide-on-mobile">
            <i class="material-icons">add_circle</i>
          </button>
          <button class="action-button">
            <i class="material-icons">photo</i>
          </button>
          <button class="action-button hide-on-mobile">
            <i class="material-icons">gif</i>
          </button>
        </div>
        <div class="input-wrapper">
          <input 
            v-model="messageContent" 
            placeholder="Type a message..." 
            @keyup.enter="handleSendMessage"
          />
          <button class="emoji-button hide-on-mobile">
            <i class="material-icons">sentiment_satisfied_alt</i>
          </button>
        </div>
        <button 
          class="send-button" 
          @click="handleSendMessage"
          :disabled="!messageContent.trim()"
        >
          <i class="material-icons">send</i>
        </button>
      </div>

      <!-- Payment section for creators -->
      <div class="payment-drawer" v-if="isCreator && showPaymentDrawer" :class="{ 'drawer-active': showPaymentDrawer }">
        <div class="drawer-header">
          <h4>Payment Request</h4>
          <button class="close-button" @click="togglePaymentDrawer">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="payment-form">
          <div class="form-group">
            <label>Amount (₱)</label>
            <input v-model="paymentAmount" type="number" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input v-model="paymentDescription" type="text" />
          </div>
          <div class="form-group">
            <label>Remarks</label>
            <input v-model="paymentRemarks" type="text" />
          </div>
          <button 
            class="payment-request-button"
            @click="handlePayment"
            :disabled="!paymentAmount || !paymentDescription || isPaymentLoading"
          >
            <span v-if="isPaymentLoading" class="loading-spinner"></span>
            {{ isPaymentLoading ? 'Processing...' : 'Send Payment Request' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="messenger-empty">
      <div class="empty-content">
        <div class="empty-icon-wrapper">
          <img src="@/assets/logo.png" alt="Messenger" class="empty-icon" />
        </div>
        <h2>Welcome to Messages</h2>
        <p>Connect with your clients and creators through instant messaging</p>
        <div class="empty-actions">
          <button class="primary-action-btn">Start a new conversation</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sendMessage, fetchMessages, fetchUsersWithChatHistory, initiatePayment, getUserIdFromToken, checkPaymentStatus } from '../authService';
import io from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
      chatHistory: [],
      messageContent: '',
      selectedReceiverId: null,
      selectedUserMessages: [],
      selectedUserName: '',
      paymentAmount: '',
      paymentDescription: '',
      paymentRemarks: '',
      paymentLink: '',
      isCreator: localStorage.getItem('userRole') === 'creator',
      currentUserId: null,
      showPaymentDrawer: false,
      isMobileView: false,
      showSidebar: true,
      isPaymentLoading: false,
    };
  },
  async created() {
    // Retrieve user ID with fallback for Google auth
    this.currentUserId = getUserIdFromToken();
    
    // If userId from token is not available, try to get from localStorage
    if (!this.currentUserId) {
      console.warn('User ID not found in token, trying alternative sources');
      this.currentUserId = localStorage.getItem('userId');
      
      // If still no userId, look for Google auth ID
      if (!this.currentUserId) {
        const googleUser = localStorage.getItem('googleUser');
        if (googleUser) {
          try {
            const parsedUser = JSON.parse(googleUser);
            this.currentUserId = parsedUser.id || parsedUser.userId;
            console.log('Using Google auth user ID:', this.currentUserId);
          } catch (e) {
            console.error('Error parsing Google user data:', e);
          }
        }
      }
    }
    
    if (!this.currentUserId) {
      console.error('No valid user ID found. User authentication may be incomplete.');
      return;
    }
    
    await this.loadChatHistory();
    this.connectSocket();
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView);
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
    window.removeEventListener('resize', this.checkMobileView);
  },
  computed: {
    selectedUserInitials() {
      if (!this.selectedUserName) return '';
      const names = this.selectedUserName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase();
    },
    groupedMessages() {
      const groups = {};
      this.selectedUserMessages.forEach(msg => {
        const date = new Date(msg.createdAt).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = {
            date: new Date(msg.createdAt),
            messages: []
          };
        }
        groups[date].messages.push(msg);
      });
      return Object.values(groups);
    }
  },
  methods: {
    connectSocket() {
      if (!this.currentUserId) return;

      this.socket = io('http://localhost:3200', {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      // Emit event to join the user's room
      this.socket.emit('joinChat', this.currentUserId.toString()); // Convert to string

      this.socket.on('connect', () => {
        console.log('Connected to socket server with userId:', this.currentUserId);
      });

      this.socket.on('receiveMessage', (data) => {
        console.log('New message received:', data);

        if (data.senderId === this.selectedReceiverId || data.senderId === this.currentUserId) {
          this.selectedUserMessages.push(data);
        }

        this.$forceUpdate();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    },
    async loadChatHistory() {
      try {
        this.chatHistory = await fetchUsersWithChatHistory();
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    },
    async loadMessages(userId) {
      try {
        this.selectedUserMessages = await fetchMessages(userId);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    },
    async selectUser(userId) {
      this.selectedReceiverId = userId;
      const userChat = this.chatHistory.find(chat => chat.user.id === userId);
      this.selectedUserName = userChat ? `${userChat.user.firstName} ${userChat.user.lastName}` : '';
      await this.loadMessages(userId);
      
      if (this.isMobileView) {
        this.showSidebar = false;
      }
    },
    checkMobileView() {
      this.isMobileView = window.innerWidth <= 768;
      if (!this.isMobileView) {
        this.showSidebar = true;
      }
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    async handleSendMessage() {
      if (!this.messageContent.trim() || !this.selectedReceiverId) return;

      if (!this.currentUserId) {
        console.error('Cannot send message: No user ID available');
        alert('Could not send message. Please try logging in again.');
        return;
      }

      try {
        const result = await sendMessage(this.selectedReceiverId, this.messageContent);
        
        // Ensure we have a valid message object
        if (!result || !result.newMessage) {
          console.error('Invalid response from sendMessage:', result);
          return;
        }
        
        this.socket.emit('sendMessage', {
          ...result.newMessage,
          receiverId: this.selectedReceiverId,
          senderId: this.currentUserId,
        });
        this.messageContent = '';
        
        // Scroll to bottom after sending
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    },
    async handlePayment() {
      if (!this.selectedReceiverId) return alert('Select a user to send a payment to.');
      
      // Set loading state
      this.isPaymentLoading = true;
      
      try {
        const paymentData = await initiatePayment(
          this.paymentAmount, 
          this.paymentDescription, 
          this.paymentRemarks,
          this.selectedReceiverId
        );
        
        if (!paymentData || !paymentData.paymentUrl) {
          throw new Error('Invalid payment data received from server');
        }

        // Create payment order message
        const paymentMessage = {
          type: 'payment',
          amount: this.paymentAmount,
          description: this.paymentDescription,
          paymentUrl: paymentData.paymentUrl,
          referenceNumber: paymentData.referenceNumber || '',
        };

        // Send the payment order as a message
        const result = await sendMessage(
          this.selectedReceiverId, 
          JSON.stringify(paymentMessage)
        );
        
        if (!result || !result.newMessage) {
          throw new Error('Failed to send payment message');
        }

        // Emit the message through socket
        this.socket.emit('sendMessage', {
          ...result.newMessage,
          receiverId: this.selectedReceiverId,
          senderId: this.currentUserId,
        });

        // Clear payment form
        this.paymentAmount = '';
        this.paymentDescription = '';
        this.paymentRemarks = '';
        this.paymentLink = '';
        
        // Close the payment drawer
        this.showPaymentDrawer = false;
        
        // Show success message
        alert('Payment request sent successfully!');
      } catch (error) {
        console.error('Error initiating payment:', error);
        alert(`Failed to send payment: ${error.message || 'Unknown error'}`);
      } finally {
        // Always turn off loading state when done
        this.isPaymentLoading = false;
      }
    },
    getInitials(firstName, lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    },
    
    truncateMessage(message) {
      return message.length > 30 ? message.substring(0, 27) + '...' : message;
    },
    
    formatDate(date) {
      const today = new Date();
      const messageDate = new Date(date);
      
      if (messageDate.toDateString() === today.toDateString()) {
        return 'Today';
      }
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      return messageDate.toLocaleDateString();
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    },
    scrollToBottom() {
      if (this.$refs.messageContainer) {
        this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight;
      }
    },
    isPaymentMessage(content) {
      try {
        const message = JSON.parse(content);
        return message.type === 'payment';
      } catch {
        return false;
      }
    },
    getPaymentDetails(content) {
      try {
        return JSON.parse(content);
      } catch {
        return null;
      }
    },
    handleMessageClick(content) {
      if (this.isPaymentMessage(content)) {
        const paymentDetails = this.getPaymentDetails(content);
        if (paymentDetails?.paymentUrl) {
          window.open(paymentDetails.paymentUrl, '_blank');
        }

        // Check payment status
        this.checkPaymentStatus(paymentDetails.referenceNumber);
      }
    },
    async checkPaymentStatus(referenceNumber) {
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          const statusData = await checkPaymentStatus(referenceNumber);
          console.log(`Payment status for ${referenceNumber}: ${statusData.status}`);

          // If the payment is paid, break the loop
          if (statusData.status === 'paid') {
            alert('Payment has been completed.');
            return; // Exit the function if payment is completed
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }

        attempts++;
        // Wait for 30 seconds before the next check
        await new Promise(resolve => setTimeout(resolve, 30 * 1000));
      }

      // If still unpaid after 5 attempts, revert to checking every hour
      console.log(`Payment for ${referenceNumber} is still unpaid after ${maxAttempts} attempts. Reverting to hourly checks.`);
      // You can implement a mechanism to check every hour here if needed
    },
    formatAmount(amount) {
      return Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    getAvatarColor(userId) {
      const colors = [
        '#1877F2', '#E84C3D', '#2ECC70', '#3498DB',
        '#9B59B6', '#F1C40F', '#E67E22', '#1ABC9C'
      ];
      return colors[userId % colors.length];
    },
    formatTimeShort(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString();
    },
    togglePaymentDrawer() {
      this.showPaymentDrawer = !this.showPaymentDrawer;
    },
  },
  watch: {
    selectedUserMessages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  }
};
</script>

<style scoped>
.messenger-container {
  display: flex;
  height: calc(100vh - 56px);
  background-color: #f5f7fb;
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.primary-text {
  background: linear-gradient(45deg, #1a237e, #6200ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

/* Mobile toggle button */
.mobile-toggle {
  display: none;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1100;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  color: #1a237e;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
}

.back-button {
  display: none;
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  margin-right: 8px;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: rgba(26, 35, 126, 0.1);
}

.messenger-sidebar {
  width: 320px;
  border-right: 1px solid #e9eef5;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, width 0.3s ease;
  z-index: 100;
  border-radius: 0 12px 12px 0;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9eef5;
  background: #ffffff;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1a237e;
}

.search-box {
  padding: 15px 20px;
  position: relative;
  background: #ffffff;
  border-bottom: 1px solid #f0f2ff;
}

.search-box input {
  width: 100%;
  padding: 12px 40px;
  border-radius: 50px;
  border: 1px solid #e0e6ff;
  background: #f8faff;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.search-box input:focus {
  outline: none;
  border-color: #6200ea;
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.1);
}

.search-box i {
  position: absolute;
  left: 35px;
  top: 50%;
  transform: translateY(-50%);
  color: #7b7f8e;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  margin: 2px 8px;
  position: relative;
}

.chat-item:hover {
  background-color: #f0f2ff;
}

.chat-item.active {
  background-color: #e7f0ff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.chat-item.unread .chat-name {
  font-weight: bold;
  color: #1a237e;
}

.chat-item.unread::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: #6200ea;
  border-radius: 50%;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  margin-right: 15px;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #9e9e9e;
  border: 2px solid white;
}

.status-indicator.online {
  background-color: #4caf50;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 15px;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.chat-preview {
  color: #7b7f8e;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  color: #7b7f8e;
  font-size: 12px;
}

.messenger-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
  overflow-x: hidden;
  border-radius: 12px 0 0 12px;
  margin: 12px 12px 12px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.chat-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9eef5;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 15px;
}

.user-details h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.online-status {
  font-size: 13px;
  color: #4caf50;
  display: flex;
  align-items: center;
}

.online-status::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  margin-right: 5px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f2ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a237e;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.action-button:hover {
  background-color: #e0e6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.action-button.primary {
  background: linear-gradient(45deg, #1a237e, #6200ea);
  color: white;
}

.action-button.primary:hover {
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: white;
  background-image: 
    radial-gradient(circle at 25px 25px, #f8faff 2%, transparent 2%),
    radial-gradient(circle at 75px 75px, #f8faff 2%, transparent 2%);
  background-size: 100px 100px;
}

.message-group {
  margin-bottom: 20px;
}

.message-date {
  text-align: center;
  margin: 24px 0 16px;
  color: #7b7f8e;
  font-size: 13px;
  position: relative;
}

.message-date:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  background: #e9eef5;
  top: 50%;
  left: 0;
  z-index: -1;
}

.message-date span {
  background: white;
  padding: 0 15px;
  border-radius: 15px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.message {
  max-width: 70%;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-sent {
  margin-left: auto;
  align-items: flex-end;
}

.message-received {
  margin-right: auto;
  align-items: flex-start;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.message-bubble.sent {
  background: linear-gradient(135deg, #1a237e, #6200ea);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.received {
  background-color: #f8faff;
  color: #333;
  border-bottom-left-radius: 4px;
  border: 1px solid #e0e6ff;
}

.message-time {
  font-size: 11px;
  color: #7b7f8e;
  margin-top: 4px;
  opacity: 0.8;
}

.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #e9eef5;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
}

.input-actions {
  display: flex;
  gap: 8px;
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #f8faff;
  border-radius: 50px;
  display: flex;
  align-items: center;
  border: 1px solid #e0e6ff;
  padding: 0 8px 0 20px;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.input-wrapper:focus-within {
  border-color: #6200ea;
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.1);
}

.input-wrapper input {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: none;
  font-size: 15px;
}

.input-wrapper input:focus {
  outline: none;
}

.emoji-button {
  padding: 8px;
  background: none;
  border: none;
  color: #7b7f8e;
  cursor: pointer;
}

.send-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #1a237e, #6200ea);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.2);
}

.send-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 18px rgba(98, 0, 234, 0.3);
}

.send-button:disabled {
  background: linear-gradient(135deg, #c5cae9, #d1c4e9);
  color: white;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.payment-bubble {
  background: linear-gradient(135deg, #e8f5e9, #e0f7fa) !important;
  border: 1px solid #c8e6c9 !important;
  padding: 16px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
}

.payment-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.payment-icon {
  font-size: 28px;
  background: rgba(46, 125, 50, 0.1);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.payment-amount {
  font-weight: bold;
  font-size: 18px;
  color: #2e7d32;
}

.payment-description {
  font-size: 14px;
  color: #333;
}

.payment-action {
  margin-top: 10px;
  font-size: 14px;
  color: #1a237e;
  font-weight: 600;
  padding: 8px 16px;
  background: white;
  border-radius: 50px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.payment-action:hover {
  background: #f0f2ff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.messenger-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.empty-content {
  text-align: center;
  color: #7b7f8e;
  padding: 3rem;
  max-width: 500px;
}

.empty-icon-wrapper {
  background: #f0f2ff;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto 24px;
  box-shadow: 0 10px 30px rgba(98, 0, 234, 0.1);
}

.empty-icon {
  width: 100px;
  height: 100px;
}

.empty-content h2 {
  color: #1a237e;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 700;
}

.empty-content p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 25px;
  color: #7b7f8e;
}

.empty-actions {
  margin-top: 25px;
}

.primary-action-btn {
  background: linear-gradient(135deg, #1a237e, #6200ea);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.2);
  transition: all 0.2s;
}

.primary-action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(98, 0, 234, 0.3);
}

.payment-drawer {
  position: absolute;
  right: -320px;
  top: 0;
  width: 320px;
  height: 100%;
  background: white;
  border-left: 1px solid #e9eef5;
  padding: 20px;
  transition: transform 0.3s ease;
  z-index: 1000;
  box-shadow: -4px 0 20px rgba(0,0,0,0.08);
}

.drawer-active {
  transform: translateX(-320px);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9eef5;
}

.drawer-header h4 {
  margin: 0;
  font-size: 20px;
  color: #1a237e;
  font-weight: 700;
}

.close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f0f2ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a237e;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.close-button:hover {
  background-color: #e0e6ff;
  transform: rotate(90deg);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 14px;
  border: 1px solid #e0e6ff;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.form-group input:focus {
  outline: none;
  border-color: #6200ea;
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.1);
}

.payment-request-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1a237e, #6200ea);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(98, 0, 234, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-request-button:hover {
  background: linear-gradient(135deg, #151d69, #5502d0);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(98, 0, 234, 0.3);
}

.payment-request-button:disabled {
  background: linear-gradient(135deg, #c5cae9, #d1c4e9);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Responsive styles */
@media (max-width: 992px) {
  .messenger-sidebar {
    width: 280px;
  }
  
  .message {
    max-width: 80%;
  }
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .back-button {
    display: block;
  }

  .messenger-container {
    position: relative;
  }
  
  .messenger-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 1000;
    transform: translateX(-100%);
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 0;
  }
  
  .messenger-sidebar.active {
    transform: translateX(0);
  }
  
  .messenger-main {
    width: 100%;
    margin: 0;
    border-radius: 0;
  }
  
  .message {
    max-width: 85%;
  }
  
  .hide-on-mobile {
    display: none;
  }
  
  .payment-drawer {
    width: 100%;
    right: -100%;
  }
  
  .drawer-active {
    transform: translateX(-100%);
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .chat-input {
    padding: 12px 16px;
  }
  
  .input-actions {
    gap: 4px;
  }
  
  .action-button {
    width: 36px;
    height: 36px;
  }
  
  .send-button {
    width: 46px;
    height: 46px;
  }
}

@media (max-width: 480px) {
  .message {
    max-width: 90%;
  }
  
  .chat-avatar {
    width: 42px;
    height: 42px;
    font-size: 16px;
  }
  
  .user-details h3 {
    font-size: 15px;
  }
  
  .online-status {
    font-size: 12px;
  }
  
  .message-bubble {
    padding: 10px 14px;
    font-size: 14px;
  }
  
  .chat-name {
    font-size: 14px;
  }
  
  .chat-preview {
    font-size: 12px;
  }
  
  .empty-content {
    padding: 2rem 1rem;
  }
  
  .empty-icon-wrapper {
    width: 120px;
    height: 120px;
  }
  
  .empty-icon {
    width: 80px;
    height: 80px;
  }
}

.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

