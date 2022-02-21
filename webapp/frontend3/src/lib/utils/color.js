import { EXPANSION_START_INDICES } from './constants';

function getRowColor(rowIndex, rowColors) {
    for (let i = 0; i < EXPANSION_START_INDICES.length; i ++) {
        if (rowIndex >= EXPANSION_START_INDICES[i]) {
            return rowColors[i];
        }
    }
}

export default getRowColor;