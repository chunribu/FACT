import newickParser from './newick'
import nexusParser from './nexus'
import nexmlParser from './nexml'
import beastParser from './beast'

export default function parser (format='newick') {
    if (format==='newick') return newickParser
    if (format==='nexus') return nexusParser
    if (format==='nexml') return nexmlParser
    if (format==='beast') return beastParser
}