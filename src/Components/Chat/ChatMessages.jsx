import React from 'react';
import ChatBubble from './ChatBubble';
import AisaTypingIndicator from '../AisaTypingIndicator';
import { logo } from '../../constants';

export const ChatMessages = React.memo(({ messages = [], listProps = {} }) => {
  const {
    isLoading,
    typingMessageId,
    expandedMessages,
    setExpandedMessages,
    activeMessageId,
    setActiveMessageId,
    editingMessageId,
    editContent,
    setEditContent,
    startEditing,
    cancelEdit,
    saveEdit,
    messageFeedback,
    handleThumbsUp,
    handleThumbsDown,
    handleCopyMessage,
    handleShare,
    handlePdfAction,
    handleDownload,
    handleMessageDelete,
    handleMessageUndo,
    handleDownloadCodeProject,
    speakResponse,
    speakingMessageId,
    isPaused,
    downloadedMessages,
    isDownloadingUrl,
    navigate,
    activateToolWithTypingEffect,
    setCurrentMode,
    viewingDoc,
    setViewingDoc,
    suggestions,
    handleSuggestionClick,
    scrollToBottom,
    setIsMagicEditing,
    setEditRefImage,
    inputRef,
    handleCopyImage,
  } = listProps;

  const isTypingIndicatorActive = isLoading && typingMessageId;

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-4 relative">
      {messages.map((msg, index) => (
        <ChatBubble
          key={msg.id || index}
          msg={msg}
          idx={index}
          messages={messages}
          typingMessageId={typingMessageId}
          expandedMessages={expandedMessages}
          setExpandedMessages={setExpandedMessages}
          activeMessageId={activeMessageId}
          setActiveMessageId={setActiveMessageId}
          editingMessageId={editingMessageId}
          editContent={editContent}
          setEditContent={setEditContent}
          startEditing={startEditing}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
          messageFeedback={messageFeedback}
          handleThumbsUp={handleThumbsUp}
          handleThumbsDown={handleThumbsDown}
          handleCopyMessage={handleCopyMessage}
          handleShare={handleShare}
          handlePdfAction={handlePdfAction}
          handleDownload={handleDownload}
          handleMessageDelete={handleMessageDelete}
          handleMessageUndo={handleMessageUndo}
          handleDownloadCodeProject={handleDownloadCodeProject}
          speakResponse={speakResponse}
          speakingMessageId={speakingMessageId}
          isPaused={isPaused}
          downloadedMessages={downloadedMessages}
          isDownloadingUrl={isDownloadingUrl}
          navigate={navigate}
          activateToolWithTypingEffect={activateToolWithTypingEffect}
          setCurrentMode={setCurrentMode}
          viewingDoc={viewingDoc}
          setViewingDoc={setViewingDoc}
          suggestions={suggestions}
          handleSuggestionClick={handleSuggestionClick}
          isLoading={isLoading}
          scrollToBottom={scrollToBottom}
          setIsMagicEditing={setIsMagicEditing}
          setEditRefImage={setEditRefImage}
          inputRef={inputRef}
          handleCopyImage={handleCopyImage}
        />
      ))}

      {isTypingIndicatorActive && (
        <div className="chatgpt-message-row ai-row group mb-6 sm:mb-8">
          <div className="chatgpt-message-content select-text">
            <div className="chatgpt-avatar-container w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <img src={logo} alt="AISA" className="w-6 h-[18px] object-cover object-top" />
              </div>
            </div>
            <div className="chatgpt-text typing-bubble flex items-center">
              <AisaTypingIndicator visible={true} message="Thinking..." />
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacer for floating input bar */}
      <div className="h-32 sm:h-40 shrink-0 pointer-events-none" />
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';
export default ChatMessages;
