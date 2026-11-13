// Scaffold content for the check ladder (add-scaffold-ladder-and-retry-cap; FR-SCA-02, FR-SCA-03).
// FLAGGED FOR THE USER TO READ AT G3: the ID and the SE document name the ladder but give no text, so
// every hint and lecture question below is [beyond ID]. A hint points at what to look at next and never
// states the answer. Formula, range and height wording come from ConventionsWording (D19); numbers
// come from the instance's facts.
import { needMisconception } from '../../assessment/ids'
import type { Wording } from '../../assessment/types'
import { NEED_IDS, type SourceMark } from '../../modules/compare'
import { NEEDS } from '../modules/structures'

export const SCAFFOLD_SOURCE: SourceMark = 'beyond ID'

export interface ScaffoldContent {
  /** Level 1, by misconception. */
  hints: Record<string, Wording>
  /** Level 1 when no misconception was recognised or no answer has been checked, by sub-skill. */
  subSkillHints: Record<string, Wording>
  /** The lecture question recorded at the retry cap, by misconception. */
  lecture: Record<string, Wording>
  /** The same, by sub-skill, when no misconception was recognised. */
  subSkillLecture: Record<string, Wording>
}

const text = (s: string): Wording => () => s

const needHints = Object.fromEntries(
  NEED_IDS.map((n): [string, Wording] => [
    needMisconception(n),
    () => `Look again at this need: ${NEEDS[n].label}. Ask whether the structure you picked guarantees it, or only often delivers it.`,
  ]),
)
const needLecture = Object.fromEntries(
  NEED_IDS.map((n): [string, Wording] => [needMisconception(n), () => `How can I tell whether a structure really meets this need: ${NEEDS[n].label}?`]),
)

export const SCAFFOLDS: ScaffoldContent = {
  hints: {
    'M-HEIGHT-NODES': (_f, w) => `Count the edges on the longest path, not the nodes. ${w.heightRule}`,
    'M-HEIGHT-IS-DEPTH': text("Height is measured from the node down to its deepest leaf, not from the root down to the node."),
    'M-ORDER-IRRELEVANT': text('Build the tree one insert at a time, in the order given. The first key is the root, and each later key goes where a search for it would end.'),
    'M-ASSUMES-BALANCED': text('Draw the tree these keys build, in the order given. Is it short and bushy, or stretched out into a line?'),
    'M-COUNTS-EDGES': text('A search looks at the node it starts from too. Count the nodes it visits, not the moves between them.'),
    'M-SEARCH-VISITS-ALL': text('At each node a search goes one way only. Follow the comparisons, and stop as soon as the key is found or there is nowhere left to go.'),
    'M-BF-SIGN': (_f, w) => `Use the rule exactly as written: ${w.formula}. Work out both heights first.`,
    'M-EMPTY-HEIGHT': (_f, w) => `An empty subtree is not a leaf. ${w.heightRule}`,
    'M-ROOT-ONLY': text("The rule applies at every node, not just the root. Check each node's two subtrees in turn."),
    'M-PERFECT-ONLY': (_f, w) => `An AVL tree does not have to be perfectly balanced. Each node's balance factor only has to be ${w.rangeText}.`,
    'M-ROTATION-DIRECTION': text('Find which side is too tall. A rotation lifts the taller child above the node and pushes the node down towards the shorter side.'),
    'M-ROOT-STAYS': text('A rotation lifts a child above the node it rotates. Ask which node ends up on top.'),
    'M-SINGLE-FOR-BENT': text('Follow the path from the unbalanced node down through its taller child. Does it go the same way twice, or does it bend?'),
    'M-ALWAYS-DOUBLE': text('Follow the path from the unbalanced node down through its taller child. A path that goes the same way twice needs one rotation; only a bend needs two.'),
    'M-HIGHEST-UNBALANCED': text('Start at the new node and go up. The first node you meet that is out of balance is the one to fix.'),
    'M-IN-RANGE-PICKED': (_f, w) => `Work out each node's balance factor. Only a node outside ${w.rangeText} is unbalanced.`,
    'M-FORGETS-REBALANCE': (_f, w) => `After the plain insert or delete, check every node on the path back up against ${w.rangeText}. Rotate wherever one is out of range.`,
    'M-DELETE-ONE-ROTATION': text('After a delete, keep going up the path. Fixing one node can leave a node higher up out of range too.'),
    'M-LEAVES-COUNT-ALL': text('A leaf is a node with no children. Go through the nodes and count only those.'),
    'M-LEAVES-COUNT-PARENTS': text('Look at the nodes at the very bottom of each branch. A leaf has nothing below it.'),
    'M-BST-PARENT-ONLY': text('Check each node against every ancestor above it, not only its parent: everything on the left must be smaller, everything on the right larger.'),
    'M-BST-NEEDS-BALANCE': text('The ordering is the only rule for a binary search tree. Check that rule at every node, and ignore how tall the tree is.'),
    'M-INSERT-NEAR-VALUE': text('Do not look for the closest value. Compare the new key with the root, go left or right, and repeat at each node until there is no child to go to.'),
    'M-INSERT-AT-ROOT': text('A new key goes where a search for it would end. Start at the root, but keep comparing and going down.'),
    'M-AVL-WORST-LINEAR': text('An AVL tree never becomes a line. Think about how tall it can get for this many keys, and how many nodes a search meets on the way down.'),
    ...needHints,
  },
  subSkillHints: {
    'bst-shape': text('Build the tree one insert at a time, in the order given, then look for its longest path.'),
    'search-cost': text('Follow the search step by step and count each node it visits.'),
    'node-height': (_f, w) => `Find the deepest leaf below the node and count the edges down to it. ${w.heightRule}`,
    'compute-balance-factor': (_f, w) => `Work out both subtree heights first, then use the rule: ${w.formula}.`,
    'avl-property': (_f, w) => `Check every node against ${w.rangeText}, not just the root.`,
    'trace-search': text('At each node compare the key and go one way. Stop when it is found or there is nowhere left to go.'),
    'search-complexity': text('Think about how the number of steps grows as the number of keys grows.'),
    rotate: text('Find which side is too tall. The rotation lifts the taller child above the node.'),
    'rotation-count': text('Follow the path from the unbalanced node down through its taller child: the same way twice, or a bend?'),
    'find-unbalanced-node': (_f, w) => `Go up from the new node and check each balance factor against ${w.rangeText}. Take the first one that is out of range.`,
    'identify-rebalance-case': text('Look at the unbalanced node and its taller child. Do they tilt the same way, or opposite ways?'),
    'rebalance-insert': text('Work in order: insert as in a BST, update the heights going up, find the lowest unbalanced node, then rotate.'),
    'delete-rebalance': text('After the delete, check each node on the path up. Rotate wherever one is out of range, and keep going to the root.'),
    'choose-structure': text('List what the situation needs, then check each need against the structure.'),
    'bst-terminology': text('Name the part you are asked about: the root is at the top, a leaf has no children, and a subtree is a node with everything below it.'),
    'bst-insert': text('Compare the new key with the root, go left or right, and repeat until there is no child to go to. That is where it attaches.'),
    'bst-search': text('At each node compare the key and go one way. Count every node you compare, including the root.'),
    'tree-height': (_f, w) => `Find the longest path down to a leaf and count its edges. ${w.heightRule}`,
  },
  lecture: {
    'M-HEIGHT-NODES': text('Why is height counted in edges and not in nodes?'),
    'M-HEIGHT-IS-DEPTH': text("What is the difference between a node's height and its depth?"),
    'M-ORDER-IRRELEVANT': text('Why can the same keys build different binary search trees?'),
    'M-ASSUMES-BALANCED': text('When does a binary search tree stay short, and when does it not?'),
    'M-COUNTS-EDGES': text('When we count the cost of a search, why do we count nodes visited?'),
    'M-SEARCH-VISITS-ALL': text('How does one comparison at a node rule out part of the tree?'),
    'M-BF-SIGN': text('Why does the order we subtract the two subtree heights matter?'),
    'M-EMPTY-HEIGHT': text('Why does an empty subtree have a different height from a leaf?'),
    'M-ROOT-ONLY': text('Why must the balance rule hold at every node and not only at the root?'),
    'M-PERFECT-ONLY': text('How far from perfectly balanced can an AVL tree be?'),
    'M-ROTATION-DIRECTION': text('How do I decide which way to rotate?'),
    'M-ROOT-STAYS': text('After a rotation, which node ends up on top, and why?'),
    'M-SINGLE-FOR-BENT': text('How can I tell from the shape whether one rotation is enough?'),
    'M-ALWAYS-DOUBLE': text('When is one rotation enough, and when do I need two?'),
    'M-HIGHEST-UNBALANCED': text('Why do we fix the lowest unbalanced node first?'),
    'M-IN-RANGE-PICKED': text('How do I tell whether a node is really unbalanced?'),
    'M-FORGETS-REBALANCE': text('Why is the tree not finished right after the plain insert or delete?'),
    'M-DELETE-ONE-ROTATION': text('Why can a delete need more than one rebalancing step?'),
    'M-LEAVES-COUNT-ALL': text('What exactly makes a node a leaf?'),
    'M-LEAVES-COUNT-PARENTS': text('How do I tell a leaf from a node with children?'),
    'M-BST-PARENT-ONLY': text('Why must the ordering hold against every ancestor and not only the parent?'),
    'M-BST-NEEDS-BALANCE': text('Does a binary search tree have to be balanced?'),
    'M-INSERT-NEAR-VALUE': text('Why does a new key follow the search path and not the nearest value?'),
    'M-INSERT-AT-ROOT': text('Where exactly does a new key attach in a binary search tree?'),
    'M-AVL-WORST-LINEAR': text('Why is the worst-case search in an AVL tree so much shorter than in a plain BST?'),
    ...needLecture,
  },
  subSkillLecture: {
    'bst-shape': text('How does the order of insertion decide the shape of a binary search tree?'),
    'search-cost': text('How do I work out how many steps a search takes?'),
    'node-height': text('How do I work out the height of a node?'),
    'compute-balance-factor': text('How do I work out a balance factor from the two subtree heights?'),
    'avl-property': text('How do I check whether a whole tree is an AVL tree?'),
    'trace-search': text('How do I trace a search through a tree?'),
    'search-complexity': text('How does the cost of a search grow with the number of keys?'),
    rotate: text('How does a rotation change the shape of a tree?'),
    'rotation-count': text('How do I know how many rotations an insert needs?'),
    'find-unbalanced-node': text('How do I find the node that is out of balance after an insert?'),
    'identify-rebalance-case': text('How do I tell which rebalancing case I am looking at?'),
    'rebalance-insert': text('What are the steps to rebalance after an insert?'),
    'delete-rebalance': text('What are the steps to rebalance after a delete?'),
    'choose-structure': text('How do I choose between these structures for a situation?'),
    'bst-terminology': text('What do the words root, leaf, child and subtree mean?'),
    'bst-insert': text('How does a new key find its place in a binary search tree?'),
    'bst-search': text('How does a search find a key in a binary search tree?'),
    'tree-height': text('How is the height of a tree worked out?'),
  },
}
