import { useReducer, useCallback } from 'react';
import { MODES } from '../utils/modeDetection';

const initialModeState = {
  activeMode: MODES.NORMAL_CHAT,
  isImageGeneration: false,
  isMagicEditing: false,
  isDeepSearch: false,
  isWebSearch: false,
  isAudioConvertMode: false,
  isDocumentConvert: false,
  isCodeWriter: false,
  isFileAnalysis: false,
  isCashFlowMode: false,
  activeLegalToolkit: false,
  selectedLegalTool: null,
  activeTool: null,
};

function chatModeReducer(state, action) {
  switch (action.type) {
    case 'ACTIVATE_MODE': {
      const modeName = action.payload;
      return {
        ...initialModeState,
        activeMode: modeName,
        isImageGeneration: modeName === MODES.IMAGE_GENERATION,
        isMagicEditing: modeName === MODES.IMAGE_EDIT,
        isDeepSearch: modeName === MODES.DEEP_SEARCH,
        isWebSearch: modeName === MODES.WEB_SEARCH,
        isAudioConvertMode: modeName === MODES.AUDIO_CONVERT,
        isDocumentConvert: modeName === MODES.DOCUMENT_CONVERT,
        isCodeWriter: modeName === MODES.CODING_HELP,
        isFileAnalysis: modeName === MODES.FILE_ANALYSIS,
        isCashFlowMode: modeName === MODES.CASHFLOW,
        activeLegalToolkit: modeName === MODES.LEGAL_TOOLKIT,
      };
    }

    case 'ACTIVATE_LEGAL_TOOL': {
      const { toolId, toolName } = action.payload;
      return {
        ...initialModeState,
        activeMode: MODES.LEGAL_TOOLKIT,
        activeLegalToolkit: false,
        selectedLegalTool: { id: toolId, name: toolName },
        activeTool: toolName,
      };
    }

    case 'OPEN_LEGAL_TOOLKIT': {
      return {
        ...initialModeState,
        activeMode: MODES.LEGAL_TOOLKIT,
        activeLegalToolkit: true,
      };
    }

    case 'CLOSE_LEGAL_TOOLKIT': {
      return {
        ...state,
        activeLegalToolkit: false,
      };
    }

    case 'SET_CASHFLOW_MODE': {
      const enabled = action.payload;
      if (!enabled) {
        return { ...state, isCashFlowMode: false, activeMode: MODES.NORMAL_CHAT };
      }
      return {
        ...initialModeState,
        activeMode: MODES.CASHFLOW,
        isCashFlowMode: true,
      };
    }

    case 'RESET_TO_NORMAL_CHAT': {
      return { ...initialModeState };
    }

    default:
      return state;
  }
}

export const useChatModeReducer = () => {
  const [modeState, dispatch] = useReducer(chatModeReducer, initialModeState);

  const activateMode = useCallback((modeName) => {
    dispatch({ type: 'ACTIVATE_MODE', payload: modeName });
  }, []);

  const activateLegalTool = useCallback((toolId, toolName) => {
    dispatch({ type: 'ACTIVATE_LEGAL_TOOL', payload: { toolId, toolName } });
  }, []);

  const openLegalToolkit = useCallback(() => {
    dispatch({ type: 'OPEN_LEGAL_TOOLKIT' });
  }, []);

  const closeLegalToolkit = useCallback(() => {
    dispatch({ type: 'CLOSE_LEGAL_TOOLKIT' });
  }, []);

  const setCashFlowMode = useCallback((enabled) => {
    dispatch({ type: 'SET_CASHFLOW_MODE', payload: enabled });
  }, []);

  const resetMode = useCallback(() => {
    dispatch({ type: 'RESET_TO_NORMAL_CHAT' });
  }, []);

  return {
    modeState,
    activateMode,
    activateLegalTool,
    openLegalToolkit,
    closeLegalToolkit,
    setCashFlowMode,
    resetMode,
  };
};

export default useChatModeReducer;
