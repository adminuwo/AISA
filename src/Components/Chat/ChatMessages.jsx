import React, { useEffect, useRef, useCallback } from 'react';
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

  const containerRef = useRef(null);
  const prevMessagesCountRef = useRef(messages.length);
  const prevIsLoadingRef = useRef(isLoading);

  const currentGeneratingMsg = typingMessageId
    ? messages.find(m => m.id === typingMessageId)
    : null;

  const hasCurrentModelResponseStarted = currentGeneratingMsg
    ? (currentGeneratingMsg.content || currentGeneratingMsg.text || '').trim().length > 0 ||
      Boolean(currentGeneratingMsg.imageUrl)
    : false;

  const isTypingIndicatorActive =
    (isLoading || Boolean(typingMessageId)) && !hasCurrentModelResponseStarted;

  // Scroll to align the latest user prompt at the top of the chat area
  const scrollToLatestUserPrompt = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const userMsgElements = container.querySelectorAll('[data-message-role="user"]');
    if (userMsgElements.length === 0) return;

    const latestUserMsg = userMsgElements[userMsgElements.length - 1];
    const containerRect = container.getBoundingClientRect();
    const elementRect = latestUserMsg.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop;

    // Position top of user prompt bubble near the top of the viewport
    container.scrollTo({
      top: Math.max(0, relativeTop - 16),
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCountRef.current;
    const isLoadingStarted = isLoading && !prevIsLoadingRef.current;

    if (isNewMessage || isLoadingStarted) {
      scrollToLatestUserPrompt();
      const t1 = setTimeout(scrollToLatestUserPrompt, 50);
      const t2 = setTimeout(scrollToLatestUserPrompt, 150);
      const t3 = setTimeout(scrollToLatestUserPrompt, 300);

      prevMessagesCountRef.current = messages.length;
      prevIsLoadingRef.current = isLoading;

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    prevMessagesCountRef.current = messages.length;
    prevIsLoadingRef.current = isLoading;
  }, [messages.length, isLoading, scrollToLatestUserPrompt]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full min-h-0 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-4 relative"
    >
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
        <div
          className="chatgpt-message-row ai-row group mb-6 sm:mb-8"
          data-message-role="model-thinking"
        >
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

      {/* Empty space below prompt & thinking indicator to ensure smooth top alignment and clean response area */}
      <div
        className={`shrink-0 pointer-events-none transition-all duration-300 ${
          isTypingIndicatorActive || isLoading || typingMessageId
            ? 'h-[calc(100vh-200px)] min-h-[500px]'
            : 'h-32 sm:h-40'
        }`}
      />
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';
export default ChatMessages;
