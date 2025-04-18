// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { ChatService } from '../../services/chat.service';
// import { ActivatedRoute } from '@angular/router';
// import { environment } from '../../../environments/environment';

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css']
// })
// export class ChatComponent implements OnInit {
//   messages: any[] = [];
//   conversations: any[] = [];
//   newMessage: string = '';
//   selectedFile: File | undefined = undefined;
//   receiverId: number | null = null;
//   isSending: boolean = false;
//   currentUserId: number | null = null;
//   selectedConversation: any = null;
//   errorMessage: string = '';

//   @ViewChild('messageContainer') messageContainer!: ElementRef;
//   @ViewChild('fileInput') fileInput!: ElementRef;

//   constructor(private chatService: ChatService, private route: ActivatedRoute) {}

//   ngOnInit() {
    
//     const userId = localStorage.getItem('user_id');
//     this.currentUserId = userId ? +userId : null;

    
//     this.chatService.getConversations().subscribe({
//       next: (conv) => {
//         this.conversations = conv;
        
//         this.route.params.subscribe(params => {
//           this.receiverId = +params['receiverId'] || null;
//           if (this.receiverId) {
//             this.selectConversation(this.receiverId);
//           }
//         });
//       },
//       error: (err) => console.error('Failed to load conversations:', err)
//     });

    
//     this.chatService.onNewMessage((chat) => {
//       if (chat.sender_id === this.receiverId || chat.receiver_id === this.receiverId) {
//         this.messages.push(chat);
//         this.scrollToBottom();
//       }
//     });
//   }

//   selectConversation(receiverId: number) {
//     this.receiverId = receiverId;
//     this.selectedConversation = this.conversations.find(conv => conv.id === receiverId);
//     this.errorMessage = '';
//     this.loadMessages();
//   }

//   loadMessages() {
//     if (this.receiverId) {
//       this.chatService.getMessages(this.receiverId).subscribe({
//         next: (data) => {
//           this.messages = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
//           this.scrollToBottom();
//         },
//         error: (err) => {
//           console.error('Failed to load messages:', err);
//           if (err.status === 403) {
//             this.errorMessage = err.error?.error || 'You can only message this worker after a confirmed booking.';
//             this.messages = [];
//           }
//         }
//       });
//     }
//   }

//   onFileSelected(event: any) {
//     this.selectedFile = event.target.files[0];
//   }

//   sendMessage() {
//     if (this.receiverId && (this.newMessage.trim() || this.selectedFile)) {
//       this.isSending = true;
//       this.errorMessage = '';
//       this.chatService.sendMessage(this.receiverId, this.newMessage, this.selectedFile).subscribe({
//         next: () => {
//           this.newMessage = '';
//           this.selectedFile = undefined;
//           this.fileInput.nativeElement.value = '';
//           this.isSending = false;
//           this.loadMessages();
//         },
//         error: (err) => {
//           console.error('Failed to send message:', err);
//           this.isSending = false;
//           if (err.status === 403) {
//             this.errorMessage = err.error?.error || 'You can only message this worker after a confirmed booking.';
//           } else {
//             this.errorMessage = 'Failed to send message. Please try again.';
//           }
//         }
//       });
//     }
//   }

//   getFileUrl(filePath: string): string {
//     return `${environment.apiUrl}/storage/${filePath}`;
//   }

//   private scrollToBottom() {
//     setTimeout(() => {
//       this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
//     }, 100);
//   }
// }