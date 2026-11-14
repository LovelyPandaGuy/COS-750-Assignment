<!-- Converted from AVL_Tree_App_ID_Document.docx (read-only copy; the .docx is the source of truth) -->

**Instructional Design Document**

COS212 App Prototype: AVL Trees and Search

# 1 Introduction

## 1.1 Purpose

This document describes the instructional design (ID) of the COS212 app. It sets out the ID approach, the learners, the learning objectives, how the content is structured and presented, how the app assesses learners and supports those who are not yet comfortable with the work, and how motivation and accessibility are handled. The technical design is in the SE document.

## 1.2 Topic and algorithm

The app teaches the **AVL tree**, a CS Core balanced tree in CS2023. The algorithm chosen is **binary** **search on an AVL tree**, which runs in O(log n) time complexity.

The two go well together because the AVL tree exists to keep search fast. Its balance rule keeps the height logarithmic, so every search is O(log2 n) in the worst case, whatever order the keys arrived in. CS2023 states this link as an outcome: “Explain how tree balance affects the efficiency of binary search tree operations”.

CS2023 lists O(log2 n) search under topic 11.b, with binary search as its example. In an AVL tree this bound is guaranteed by the AVL property: each comparison moves one level down and rules out one branch, and the height of an AVL tree is at most roughly 1.44 log(n + 2) − 1.328. Ruling out part of the search space at every step is the decrease-and-conquer approach CS2023 links to binary search (AL-Strategies topic 1.b.ii). Because the guarantee comes from the AVL property, the app teaches search together with the balance factors and rotations that make it possible.

The app also covers rotations, insertion and deletion. These are the AVL tree’s operations: for every data structure, CS2023 expects students to explain step-by-step how the ADT operations associated with the data structure transform it (AL-Foundational, illustrative learning outcome 1.b).

# 2 Alignment with CS2023

The table lists the CS2023 items the app covers.

| **Knowledge unit** | **CS2023 item** | **App Lessons and LOs** |
|---|---|---|
| AL-Foundational | Topic 1.a “Dictionary operations (insert, delete, find)” | C4, C6, C7 (LO3, LO5, LO7) |
| AL-Foundational | Topic 9.a “Binary, n-ary, and search trees” (prerequisite) | C1, C2 (LO1) |
| AL-Foundational | Topic 9.b “Balanced (e.g., AVL, Red-Black, Heap)” | C3 to C8 (LO1 to LO7) |
| AL-Foundational | Topic 11.b “O(log2 n) complexity (e.g., binary search)” | C4 (LO3) |
| AL-Foundational | ILO 1.a “Explain its definition, properties, representation(s), and associated ADT operations” | C3 (LO2) |
| AL-Foundational | ILO 1.b “Explain step-by-step how the ADT operations associated with the data structure transform it” | C5, C6, C7 (LO4, LO5, LO7) |
| AL-Foundational | ILO 2 “For each algorithm in this unit explain step-by-step how the algorithm operates” | C4 (LO3) |
| AL-Foundational | ILO 4 “Given requirements for a problem, develop multiple solutions using various data structures and algorithms …” | C8 (LO6) |
| AL-Complexity | Topic 1.a best, average and worst case; topics 2.b.ii–iii O(log2 n) and O(n) | C2, C4 (LO1, LO3) |
| AL-Complexity | Topic 5 time and space tradeoffs | C8 (LO6) |
| AL-Complexity | ILO 4 explain an algorithm’s runtime complexity class; ILO 9 how tree balance affects BST efficiency | C2, C4, C8, C9 (LO1, LO3, LO6) |
| AL-Strategies | Topic 3 “Iteration vs recursion (e.g., factorial, tree search)” | C4 (LO3) |

# 3 Instructional design approach

## 3.1 ID process model: SAM 2

We follow the Successive Approximation Model, SAM 2. SAM is an agile, iterative model. We chose it because it is built around prototypes in which every cycle produces a working version that is reviewed and improved, and the specification is for a working prototype of the app. SAM 2 also fits our SE plan, which builds the app in three short iterations.

- **Preparation phase.** Information gathering: the exam specification, CS2023, the COS212 slides on complexity, BSTs and AVL trees, the prescribed COS212 textbook and the COS750 lectures on educational software development.
- **Iterative design phase.** Project planning and design of the lessons, screens, assessment and feedback, as described in this document.
- **Iterative development phase.** Design proof, then alpha, beta and gold “releases”. These line up with the SE iterations: I1 (engine and tree drawing), I2 (learning flow) and I3 (assessment and evaluation).

## 3.2 Lesson strategy: Merrill with Gagné as a checklist

Each lesson follows Merrill’s first principles of instruction: learning starts from a problem, activates prior knowledge, demonstrates, lets the learner apply, and ends with integration. Gagné’s events are used as a checklist. Merrill gives the problem first, and Gagné ensures everything is covered.

| **Merrill phase** | **Gagné events** | **Screens** |
|---|---|---|
| Task-centred (problem) | 1 Gain attention; 2 Inform learners of objectives | The lesson opens with a problem to solve and a plain-language goal. |
| Activation | 3 Stimulate recall of prior learning | One or two quick questions on what the student already knows from the BST lectures. |
| Demonstration | 4 Present the content; 5 Provide learner guidance | Animated worked example with a caption per step, and a static hint. |
| Application | 6 Elicit performance; 7 Provide feedback | The student does the task and gets immediate feedback. |
| Integration | 8 Assess performance; 9 Enhance retention and transfer | The short check, then a summary and a question on a new tree. |

C2 uses all nine events in full, so students learn how a lesson works. C3 to C8 keep events 4 to 8 (content, guidance, practice, feedback and the check) in full and use shorter versions of the others: the hook and the objective take a line or two, recall is a single question, and the summary is a short box. This keeps the pattern familiar without repeating the same screens in every lesson.

## 3.3 Type of educational software

Educational software is software made for an educational purpose. The COS212 app is a **tutorial** with an embedded **simulation** (a tree sandbox and step-through animations) and **practice items** (drill and practice). Students use it individually before the lecture, and it prepares them for the lecture.

# 4 Learner analysis

The learners are second-year COS212 students who use the app before the AVL lecture. The brief says that no knowledge of AVL trees or of the search algorithm may be assumed. The students have, however, just covered complexity analysis and Big-O notation and binary search trees: tree terms, height, the BST property, search, traversals, insertion and deletion. The app builds on these lectures. C1 checks the key prerequisites, and students who need it get a short BST refresher. This supports the constructivist idea that new learning builds on prior knowledge.

The students are novice users of this content, with a casual-user mindset: they have never seen AVL trees and may use the app only once. Nothing in the app should need learning before they can start.

Students work on their own, at their own pace, for about one hour split into nine lessons, with breaks possible between lessons.

Learners differ: there is no such thing as an average human, and the group may include learners with visual impairments (including colour blindness), hearing impairments, dyslexia and ADD/ADHD. Section 11 explains how the app caters for them. The app does not use a learning-style questionnaire (Section 8.1).

# 5 Learning objectives and assessment criteria

Each objective has assessment criteria with a pass descriptor and four differentiated descriptors (Limited, Satisfactory, Good, Excellent); the full descriptors are in Appendix A. BST knowledge is treated as a prerequisite and checked in C1.

## 5.1 Learning objectives

| **LO** | **After the app, students can …** | Bloom level | **Lesson** | **CS2023** |
|---|---|---|---|---|
| LO1 | Explain how AVL trees address the inefficiencies of unbalanced BSTs. | Understand | C2 | AL-Complexity ILO 9; AL-Found. 9.a |
| LO2 | Calculate node heights and balance factors to determine whether a given binary search tree satisfies the AVL balance property. | Apply | C3 | AL-Found. 9.b, ILO 1.a |
| LO3 | Trace AVL searches and explain their logarithmic time complexity. | Apply and Understand | C4 | AL-Found. 11.b, ILO 2; AL-Complexity ILO 4; AL-Strategies 3 |
| LO4 | Identify and perform single or double rotations to restore AVL balance. | Apply | C5 | AL-Found. ILO 1.b |
| LO5 | Perform AVL insertions while maintaining the AVL property. | Apply | C6 | AL-Found. 1.a, ILO 1.b |
| LO6 | Identify practical applications of AVL trees and justify their suitability. | Evaluate | C8 | AL-Found. ILO 4; AL-Complexity 5 |
| LO7  
(minimal) | Delete a leaf from an AVL tree and restore the AVL property. | Apply | C7 | AL-Found. 1.a, ILO 1.b |

## 5.2 Assessment criteria

| **Objective** | **Assessment criteria** | **Assessment approach** |
|---|---|---|
| LO1 BST inefficiencies | 1. Correctly identifies the problem of unbalanced BSTs.<br>2. Explains how AVL balancing improves search efficiency. | Explanation quality: accuracy, depth and key points covered. |
| LO2 Balance factors | 1. Correctly calculates node heights and balance factors.<br>2. Identifies all nodes violating the AVL property. | Objective correctness. |
| LO3 Search | 1. Follows the correct search path.<br>2. Identifies successful searches.<br>3. Identifies unsuccessful searches.<br>4. Explains how AVL trees maintain O(log n) search complexity. | Trace correctness and explanation quality. |
| LO4 Rotations | 1. Correctly identifies the unbalanced node.<br>2. Determines the appropriate rotation (Case 1 to 4 (LL, LR, RL and RR): single or double rotation).<br>3. Performs the required rotation(s) correctly.<br>4. Independently verifies that the resulting tree satisfies AVL balance and BST ordering properties. | Objective correctness. |
| LO5 Insertion | 1. Correctly inserts nodes according to BST ordering.<br>2. Updates node heights and calculates balance factors correctly.<br>3. Identifies the lowest unbalanced node and determines the appropriate rotation.<br>4. Performs the necessary rotations to restore AVL balance while preserving BST ordering. | Objective correctness, with partial credit for individual steps. |
| LO6 Applications | 1. Selects appropriate applications of AVL trees.<br>2. Explains how AVL properties benefit the selected applications. | Relevance, accuracy and justification quality. |
| LO7 Leaf deletion | 1. Correctly removes a leaf while keeping BST ordering.<br>2. Updates balance factors and identifies any unbalanced node.<br>3. Restores balance with a single rotation where one is needed. | Objective correctness. |

# 6 Learning theories applied

The lesson design is based on four learning theories.

- **Behaviourism.** Immediate feedback reinforces correct responses, so the app gives feedback after every answer (Section 10.1).
- **Cognitivism.** Memory has limits and information should be chunked. Each screen holds one concept, and animations advance one step at a time.
- **Constructivism.** Learners build on what they already know and meet the problem before the explanation. C1 and the recall questions connect to the BST lectures, each lesson opens with a problem, and the written rule comes after the example.
- **Social cognitive theory.** Learners learn by watching a model. Worked examples step through an expert’s solution before the student tries.

# 7 Content structure

## 7.1 Overview

The content is split into nine lessons, C1 to C9. They move from the problem (BSTs that become lopsided) to the structure (the AVL property), then the algorithm (search), then how balance is kept (rotations, insertion, deletion), and finally a readiness check. Students move forward in order and can return to any completed lesson.

| **ID** | **Lesson** | **Focus** | **Objectives** |
|---|---|---|---|
| C1 | Getting started and readiness check | How the app works, conventions, settings; five prerequisite questions; BST refresher if needed. | Prerequisites |
| C2 | When BSTs go lopsided | Sorted inserts build a chain; search cost depends on height. | LO1 |
| C3 | The AVL property | Height, balance factor, the AVL rule at every node. | LO2 |
| C4 | Search (the algorithm) | BST search on an AVL tree, loop and recursive; O(log n). | LO3 |
| C5 | Rotations | Single and double rotations; BST order is preserved. | LO4 |
| C6 | Insertion with rebalancing | The four cases and their fixes. | LO5 |
| C7 | Deletion with rebalancing (optional) | Delete a leaf; update balance factors; at most one single rotation. | LO7 |
| C8 | Choosing a structure | Practical applications of AVL trees and their trade-offs. | LO6 |
| C9 | Am I ready for the lecture? | One question per objective plus combined questions; readiness report. | All |

## 7.2 Lesson details

### C1 Getting started and readiness check

- **Content:** how the app works (each answer carries a confidence rating, any step can be replayed), the conventions card (Section 7.3) and the settings, including accessibility options and turning off the confetti.
- **Check:** five prerequisite questions taken from the BST lectures: tree terms, “is this a BST?”, where a new key is inserted, a BST search path, and the height of a node. Using the same terms and examples as these lectures activates prior knowledge, the second of Merrill’s principles.
- **Route:** 4 or 5 correct goes to C2. Fewer than 4 goes to the BST refresher, a short re-check, then C2.

### C2 When BSTs go lopsided (LO1)

- **Problem:** the student inserts 10, 20, 30, 40, 50 into a plain BST. The tree becomes a chain, so finding 50 takes 5 comparisons. Then: “What about a million sorted keys?” In the same way, inserting A D E F Z gives a chain while E A D F Z gives a balanced tree: sorted input turns a BST into a linked list.
- **Content:** search cost depends on the height of the tree; ideally each step removes about half of the keys; a logarithm counts how many times n can be halved; the worst case is O(n). Preview: the same keys in an AVL tree give 20 at the root and only 3 levels.
- **Check:** two questions, one per LO1 criterion: how insertion order affects tree height and search cost, and how AVL balancing keeps search fast.

### C3 The AVL property (LO2)

- **Content:** the height of a node (the number of edges on the longest path down to a leaf); the balance factor bf = h(right) − h(left); and the rule that every node has a balance factor of −1, 0 or +1. The rule applies at every node, not just the root, and the tree does not have to be perfectly balanced. Each node stores its height. Stated without proof: the height of an AVL tree is at most roughly 1.44 log(n + 2) − 1.328, and in practice only slightly more than log n.
- **Activity:** fill in the balance factor of each node; spot the problem in a tree whose root looks balanced.
- **Check:** calculate heights and balance factors; decide whether a tree is an AVL tree.

### C4 Search: the algorithm (LO3)

- **Content:** AVL search compares the key with the node, goes left if the key is smaller and right if it is larger, and stops when the key is found or the branch is empty (Section 7.4). The search reads only keys, not balance factors; the AVL property matters because it limits how long the search path can be. There is at most one comparison per level, and the height of an AVL tree is at most roughly 1.44 log(n + 2) − 1.328, so with 1,000,000 keys a search needs at most 28 comparisons. Each comparison rules out one branch, the decrease-and-conquer idea behind binary search (AL-Strategies topic 1.b.ii). The loop and recursive versions are shown side by side (AL-Strategies topic 3).
- **Activity:** “Be the algorithm” on AVL trees with their balance factors shown: the student clicks the next node to visit while the matching pseudocode line lights up. A step counter shows that no search is longer than the height of the tree plus one.
- **Check:** trace a search for a key that is found and one that is not; give the most comparisons a search can need in an AVL tree of a given height; explain why the number of steps grows like log n.

### C5 Rotations (LO4)

- **Content:** a single rotation swaps the roles of a child and its parent without breaking the BST order. In a right rotation the parent becomes the right child of its left child; in a left rotation the parent becomes the left child of its right child. The step-by-step version uses grandparent G, parent P and child C. A double rotation is two single rotations.
- **Activity:** select a node and choose the rotation; an in-order check shows that the key order has not changed. Students already know that an in-order traversal lists the keys in sorted order.
- **Check:** four questions, one per LO4 criterion: find the unbalanced node, choose a single or double rotation, perform it, and confirm that the result is a valid AVL tree in BST order.

### C6 Insertion with rebalancing (LO5)

- **Content:** the four cases and their fixes, using this procedure: insert as in a BST, backtrack towards the root updating balance factors, stop at the first node n with a balance factor below −1 or above +1, decide the case and rotate. One fix is always enough: after the rotation, the subtree has the same height as before the insertion, so no ancestor needs rebalancing.
- **Activity:** worked examples that hand over control step by step: the first is fully worked, the second is guided, the third is done alone. The worked examples follow the textbook’s running example (insert 3, 2, 1, then 4 to 7, then 16 down to 10, then 8 and 9). That sequence uses all four cases, and students can check each step in the textbook.
- **Check:** four questions, one per LO5 criterion: place the new key, update heights and balance factors, find the first unbalanced node and choose the rotation, and build the final tree.

### C7 Deletion with rebalancing (optional, LO7)

- **Content**: deleting a leaf. The leaf is removed, then balance factors are updated from its parent up to the root. If a node's balance factor becomes +2 or −2, one single rotation restores balance. The examples are chosen so that at most one single rotation is needed. For example, in the tree with 20 at the root, 10 on the left and 40 on the right (with children 30 and 50), deleting 50 needs no rotation, while deleting 10 gives node 20 a balance factor of +2 and needs a single left rotation about 20.
- **Check**: optional; three questions, one per LO7 criterion. It does not block progress.

### C8 Choosing a structure (LO6)

- **Content:** where AVL trees are a good fit: data that must stay in sorted order and is searched often, where a guaranteed O(log n) search matters more than the extra work on updates. Examples include a word list for a spell checker, an index of student numbers and a contacts list kept in alphabetical order. The cost is a stored height or balance factor in every node and rotation work on insertion and deletion (CS2023 AL-Complexity topic 5, time and space tradeoffs); balanced trees take longer on updates but protect against the worst cases. Red-Black trees are mentioned as a balanced tree with a looser balance rule, not compared in full.
- **Activity and check:** scenario cards: decide whether an AVL tree suits a described application and justify the choice from its properties (LO6). One scenario has keys that arrive in sorted order.

### C9 Am I ready for the lecture? (all objectives)

- One question per objective plus two combined questions (build an AVL tree, then search it). A question missed earlier comes back once in a new form.
- **Readiness report:** Ready or Revise per objective, with links to the matching examples, and the student’s overall title (Section 10.4). The student writes down one question to ask in the lecture.
- **Certificate of completion:** the student can generate a certificate showing their name, the lessons completed, their title and the date (Section 10.4).

## 7.3 Conventions

The app uses the conventions from the COS212 slides. All of them are stored in the conventions file (Section 12).

| **Item** | **Convention** |
|---|---|
| Height of a node | The length of the longest path from the node to a leaf, counted in edges. A leaf has height 0. An empty subtree has height −1. |
| Balance factor | bf = h(right) − h(left). Valid values are −1, 0 and +1. Negative means the left branch is taller. |
| Unbalanced node | Called n, with children n.left and n.right. |
| Case names | Case 1 (LL): new key in the left subtree of the left child of n. Case 2 (LR): right subtree of the left child. Case 3 (RL): left subtree of the right child. Case 4 (RR): right subtree of the right child. Cases 1 and 4 are “outside”; cases 2 and 3 are “inside”. |
| Fixes | Case 1: right rotation about n. Case 2: left rotation about n.left, then right rotation about n. Case 3: right rotation about n.right, then left rotation about n. Case 4: left rotation about n. |
| Rotation terms | “Single rotation” and “double rotation” (Left-Right, Right-Left). Captions say “rotate C around G”: the child moves up around its parent. |
| Deletion | Only leaf deletions are covered: remove the leaf, then update balance factors from its parent up to the root. |
| Wording | “Left branch” and “right branch” in student-facing text; O(lg n) and O(log n) mean the same. |

## 7.4 The search algorithm

C4 presents AVL search in two versions. The loop version is shown first because search follows a single path through the tree. The recursive version covers CS2023 AL-Strategies topic 3 (iteration vs recursion).

**Loop version**

| search(el)<br>p = root<br>while p is not null<br>if element in node p equals el<br>return element in node p  // el was found<br>else if el < element in node p<br>p = p.left<br>else p = p.right<br>return null  // el was not found |
|---|

**Recursive version**

| search(el, root)<br>if root is null<br>return null  // end of tree reached<br>else if element in root equals el<br>return element in root  // el was found<br>else if el < element in root<br>return search(el, root.left)<br>else<br>return search(el, root.right) |
|---|

# 8 Presentation design

## 8.1 Representations and learning styles

No single learning style meets all the needs of a learner, learning environments must be adaptable, and several styles must be considered. The app therefore offers several representations of each concept and lets each learner use the ones that suit them. It does not, however, test learner types. Each screen has one main representation, with others available on demand. This keeps the screen within the limits of short-term memory.

| **Representation** | **VARK** | **Kolb / Honey and Mumford** | **AVL example** |
|---|---|---|---|
| Animated tree | Visual; kinesthetic when the student controls it | Reflector (watching); Activist | A rotation shown one step at a time |
| Static labelled diagram | Visual | Reflector | Before and after a rotation, with balance factors on nodes |
| Written rule | Read/write | Theorist | “Balance factor = height of right branch − height of left branch” |
| Worked example | Read/write and visual | Theorist, Pragmatist | A full insertion with every balance factor shown |
| Interactive task | Kinesthetic | Activist, Pragmatist | Click a node to rotate it, or enter its balance factor |

| Concept | **Teaching screen (main)** | **On demand** | **Practice screen (main)** |
|---|---|---|---|
| Why balance matters | Animation: step counter on a chain vs a balanced tree | Labelled diagram; short caption | Predict, then reveal: “which is quicker?” |
| Balance factor | Labelled diagram with a balance factor on each node | “Show the rule” toggle; worked example | Click a node and enter its balance factor |
| Search | Animation of the search path with a step counter | Pseudocode panel (loop and recursive) | Click the next node to visit |
| Single rotation | Animation, one rotation step at a time | Before-and-after diagram; caption per step | Click to rotate, with a static hint |
| The four cases | Case chart (diagram) | Written rule per case; worked example | Classify the case, then choose the rotation |
| Double rotation | Animation: two rotations, one step at a time | Worked example; written rule | Perform both rotations, or predict the result |

Each lesson also follows Kolb’s cycle, which describes an ideal learning process. The opening problem and first attempt are the concrete experience. A “what changed?” prompt after the animation gives reflective observation. The written rule, shown after the example, gives abstract conceptualisation. Practice on a new tree gives active experimentation. Placing the rule after the experience is deliberate and matches the Merrill structure.

Audio narration is text-to-speech in the prototype.

## 8.2 Pacing and cognitive load

- Each screen holds one concept, one main representation and at most one supporting element. This keeps within the limits of short-term memory.
- Animations show one rotation action per step, with a one-line caption, and then wait for the student. This supports chunking and learner control.
- There are no timers. Anxiety reduces short-term memory and slows learning, and some students fear failure.
- A progress indicator shows “Lesson 4 of 9” and a simple bar. This supports clear goals and visible progress and the revealed-structure principle.
- A session takes about one hour in nine lessons, and students can stop between lessons. Short sessions suit a pre-lecture tool.

**Controls**

- **Next and Back** are always visible in the same place on every screen. This supports consistency and controllability.
- **Replay step** re-runs only the current step, so the student can look again without restarting. This supports control.
- **Auto-play** is a stretch feature: optional, with a speed control, and paused by default. This avoids forcing a pace.
- **Show the rule** toggles the written rule, so it is available on demand without crowding the screen.
- **Hint** opens the question’s static hint (Section 9.4).
- **Skip ahead** is allowed on explanation screens but not on checks. Experienced users find many small steps tedious.
- **Lesson** **list:** any completed lesson can be revisited; new lessons unlock in order. This keeps the order fixed going forward and free going back.

## 8.3 Screen and interaction design

The main dialogue style is direct manipulation: students click nodes and click Rotate. Command languages and free typing are avoided, because they add friction for novice users. The design follows the desirable dialogue characteristics: immediate feedback, consistency, observability, controllability (where have I been, where am I, where am I going), a low information load, and a system that is intuitive, friendly and forgiving.

- **Top region:** lesson name, position and progress bar. This supports revealed structure.
- **Tree area:** the largest region, centred, with space around it. Every node shows its balance factor. This supports spaciousness and lowers the load on working memory.
- **Caption:** directly under the tree, one or two lines of plain language. This supports grouping.
- **Control strip:** in the same position on every screen, with navigation (Back, Next, Replay) on one side and learning aids (Show rule, Hint) on the other. This supports consistency.
- **Wording:** one typeface, short sentences, and the same term for the same thing everywhere. This supports consistency.
- **Interactive objects:** hover, selected, correct and incorrect states each look different. This supports the illusion of manipulable objects and immediate feedback.
- **Animation:** short, smooth moves between states. The only decorative effect is a short burst of confetti when a lesson is completed, and students can turn it off. This keeps the information load low.
- **Wrong answers and invalid moves:** the message says what happened and what to try, in a calm tone, and invalid moves can be undone. This supports forgiving design and reduces anxiety.

# 9 Assessment and scaffolding

The brief asks for an assessment that gives extra support to students who are not comfortable with the work before the lecture. All assessment in the app is formative: low stakes, private and measured against the criteria in Section 5. The app itself awards no marks; the bonus-mark proposal is described in Section 10.4.

## 9.1 Assessment points

| **Point** | **Lesson** | **What happens** | **Result** |
|---|---|---|---|
| Readiness check | C1 | Five prerequisite questions from the complexity and BST lectures. | Per-skill list; BST refresher if fewer than 4 of 5 are correct. |
| Lesson checks | C2 to C8 (C7 optional) | A short check at the end of each lesson: one question per assessment criterion of the lesson’s objective. Students have the option to reattempt questions. | Concepts mastered or to review, plus a recommended route. |
| Final readiness check | C9 | One question per objective plus two combined questions; a missed question returns once in a new form. | Ready or Revise per objective; a question for the lecture. |

Each lesson check asks one question per assessment criterion of the lesson’s objective: two questions in C2, C3 and C8, three in C7, and four in C4, C5 and C6. Results are expressed as the share of criteria met, so the mastery threshold and the routing bands work the same way for checks of different sizes. Each check question allows one re-attempt: if the first answer is wrong, the student sees the feedback and tries once more, and the question counts as correct if either attempt is right.

## 9.2 Measuring “not comfortable”

- Each answer comes with a confidence rating, **sure** or **not sure**. A wrong answer given with confidence is flagged in the readiness report.
- Results are shown per concept, together with the student’s title for the check, so the student can see which idea needs work without a raw mark.
- The routing band after each check (Section 9.3) decides what support is recommended.

## 9.3 Routing after a check

The app recommends a route and the student decides. This supports intrinsic motivation through choice and control, since rigid contingency can demotivate less-skilled users. Anxious learners also tend to avoid help, so a recommended default works better than a bare “review?” button.

| **Result of the check** | **The app says** | **The student can** |
|---|---|---|
| Low (C: Complexity Cadet) | “Let’s revisit [missed concept], with a worked example.” (default button) | Review, or continue anyway |
| Middle (B: BST Boss) | “You’ve got the main idea. Review [missed concept]?” | Targeted review, or continue |
| High (S: Structural Savant or A: AVL Ace) | “Ready for the next lesson.” An optional challenge is offered. | Continue, or try the challenge |

Each check gives the student one of four titles, ranked from S to C in line with the four descriptor levels. The title depends on the share of the lesson’s criteria met: S, Structural Savant, for 100% (excellent); A, AVL Ace, for 66% or more (good); B, BST Boss, for 50% or more (satisfactory); and C, Complexity Cadet, for below 50% (limited). S and A lead to the high band in the table above, B to the middle band and C to the low band. A lesson counts as mastered at A (AVL Ace) or higher; students below it are offered review but are never blocked. If a student skips help several times, a soft nudge appears (for example “This lesson builds on balance factors, which you missed”), without blocking them. The app logs whether students follow the recommendation, which gives evidence for the beta review in SAM 2.

## 9.4 Hints and the support ladder

Hints are **static**. Each question has one hint, written in advance, that states what the question assesses and which idea it relies on. For example: “This question checks that you can follow a search path: compare the key with the node, then go left or right.” The hint does not change with the student’s answer. Hints are available in both practice tasks and lesson checks. This links each hint to the purpose of the assessment and its criterion (Section 5.2), and keeps the hints simple to write and check for correctness.

The app records how many hints a student opens for each question. This shows which questions students find hardest and is used when the app is evaluated (Section 13).

When a student chooses to review after a check, support increases one level at a time. All support is static: it is linked to the skill the question tests, not to the student’s particular answer.

- **Static hint** for the question, then a new question of the same type.
- **Worked example** of the same skill, then another new question.
- **Guided step-through** of the same skill. After this, the student continues and the topic is added to their list of questions for the lecture.

## 9.5 Question types

- Multiple choice, where each wrong option is linked to a known misconception and has its own explanation.
- Click the node (for example the first unbalanced node).
- Enter a value (a height or a balance factor).
- Classify the case (Case 1 to 4: LL, LR, RL and RR).
- Trace a search path or build the final tree. The app marks these by comparing with the engine’s result.

## 9.6 Expected misconceptions

The prototype cannot be tested with COS212 students before the lecture, so this list is based on the errors we expect from the course material, especially with balance factors and rotations.

| Misconception | **Lesson** | **How the app responds** |
|---|---|---|
| Thinking a BST is always balanced | C2 | The student builds a chain themselves. |
| Sign mistake in the balance factor (using left − right) | C3 | Feedback restates bf = h(right) − h(left) with the node’s own numbers. |
| Only checking balance at the root | C3 | “Spot the problem” trees with a balanced root and a deeper violation. |
| Thinking “balanced” means every level is full | C3 | Shows valid AVL trees that are not full; requiring equal heights everywhere would be too rigid. |
| Thinking AVL search uses balance factors | C4 | The pseudocode has no balance-factor step; a caption explains that balance only limits the length of the path. |
| Thinking a rotation breaks the BST order | C5 | In-order check before and after each rotation. |
| Using a single rotation for an inside case (Case 2 or 3) | C5, C6 | An animation shows the single rotation failing. |
| Rebalancing at the root or at the new node instead of the first unbalanced node | C6 | “Click the node” questions; feedback highlights the path back up. |

# 10 Feedback and motivation

## 10.1 Feedback messages

Feedback after an answer has four parts: a verdict (“Not quite.” or “That’s right.”), the reason (“This node’s right branch is taller than its left branch, so its balance factor is positive.”), a link to the concept (“Review: balance factors”) and the next step (“Try again” or “Continue”). Feedback explains the reasoning rather than just the result.

**Worked example of a wrong answer (C3).** The chain 10 → 20 → 30 → 40 → 50 is shown, and the student is asked for the balance factor of node 10.

- Node 10 has no left branch, so its left height is −1. Its right branch (20, 30, 40, 50) has height 3.
- Using the lecturer’s convention, bf = h(right) − h(left) = 3 − (−1) = +4.
- The student enters −4. This is a sign mistake.
- The app responds: “Not quite. The balance factor is the height of the right branch minus the height of the left branch. Node 10’s right branch has height 3 and its left branch is empty (height −1), so the balance factor is 3 − (−1) = +4. A taller right branch gives a positive number.”
- The student can try again or open “Review: balance factors”. A wrong answer is never lost silently.

## 10.2 Tone and timing

- Wording is calm and positive: no “Wrong!” and no red flash. Wrong answers use gentle phrases such as “Not quite” or “Almost there”, but still say clearly what was missed. This supports forgiving design and reduces anxiety.
- Feedback names the specific misconception where possible. This makes the feedback constructive.
- Correct answers are explained briefly too. This confirms the reasoning, not just the guess.
- Feedback is immediate, after each question, so the student is never left wondering.
- Practice tasks allow unlimited retries and check questions allow one re-attempt, which keeps the stakes low and lets students learn from errors.
- During practice and checks, feedback is immediate and the static hint is available. After a check, the student sees concepts mastered or to review and the recommended route. After the last lesson, the C9 readiness report shows what was covered, what to revise and what to listen for in the lecture.

## 10.3 Motivation

Malone and Lepper’s framework has four individual factors (challenge, curiosity, control, fantasy) and three interpersonal factors (competition, cooperation, recognition).

| **Factor** | **Principle** | **Design** |
|---|---|---|
| Challenge | Clear goals; uncertain outcomes; performance feedback | One stated goal per lesson and a progress bar; practice tasks get harder in steps; an optional challenge for high scorers. |
| Curiosity | Show learners that their knowledge is incomplete or inconsistent | Predict, then reveal; the student’s own BST becomes a chain in C2; a single rotation that fails on an inside case. |
| Control | Contingency, choice and power | Skip ahead; choosing the review route; the student’s own rotation changes the tree. |
| Fantasy | Imagined objects or situations; accuracy matters | Playful titles (Structural Savant, AVL Ace, BST Boss, Complexity Cadet) give a light sense of identity, while the trees themselves stay accurate. |
| Recognition | Make effort and results visible | Completed-lessons view, concepts-mastered summary, titles, confetti on completion and a certificate of completion. |
| Competition | Needs a winner; must not overshadow intrinsic motivation | Not used between students: titles describe each student’s own result and are never ranked against others. |
| Cooperation | Group work with a clear goal | Not used: students work alone before the lecture. |

Flow needs clear goals and progress, clear and immediate feedback, and a balance between challenge and skill. The app gives one goal and a progress bar per lesson, feedback after every answer, and difficulty that rises in steps, with support when a check shows a gap. Students driven to achieve get optional challenges. Students who fear failure get low-stakes checks, no timers and positive titles instead of raw marks.

## 10.4 Progress and rewards

A progress bar and “Lesson 4 of 9” are always visible. This supports clear goals. A concepts-mastered checklist makes effort visible. This supports recognition without the anxiety of a raw mark.

After each check and at the end of C9, the student receives a title based on their result, ranked from S to C: S, Structural Savant; A, AVL Ace; B, BST Boss; or C, Complexity Cadet (Section 9.3). The title describes the student’s own result and is never compared with other students. All four titles are worded positively, so a lower result still reads as progress rather than failure.

A short burst of confetti marks the completion of each lesson. Students can turn it off in the settings, and once it is off it stays off.

At the end of C9, the student can generate a certificate of completion. It shows the student’s name, the lessons completed, their title and the date. The name is typed in on the screen when the certificate is generated and is not stored by the app.

The rewards are small and come after the work, so they recognise effort without becoming the reason to do it.

**Proposal to the COS212 module coordinator:** completed lessons could earn a bonus of up to 5% on the module mark. The student takes the certificate to the module coordinator, who decides whether to award the bonus.

# 11 Accessibility and special needs

The app follows the Universal Design for Learning (UDL) framework by CAST, whose philosophy is to change the environment, not the learner. The app applies its three principles.

- **Engagement (why):** choice of pace and route, skip ahead, no timers, and real applications in C8. This keeps learners interested.
- **Representation (what):** several representations per concept; a text description of every tree and step for screen readers; balance factors shown as numbers; and colour always backed up by a label or shape.
- **Action and expression (how):** answers by clicking, keyboard or touch, with a tap or keyboard alternative for every drag action.

## 11.1 Colour

Colour-blind learners do see colour, but they confuse some pairs, most often red and green, which are the usual choice for right and wrong. The app avoids that pair and never uses colour as the only signal. Feedback panels use words and icons (“That’s right”, “Not quite”), not red and green.

| Meaning | **Hex** | **Text colour** | **Non-colour backup (always included)** |
|---|---|---|---|
| Balanced node | #0072B2 | White | Balance factor shown on the node (−1, 0 or +1) |
| Unbalanced node | #E69F00 | Near-black | Balance factor shown (for example +2), a “!” marker and a thick dashed outline |
| Node being rotated | #F0E442 | Near-black | An arrow along the move, a bold outline and a text caption |
| Newly inserted node | #56B4E9 | Near-black | A “NEW” tag beside the node |

The app uses this colour-blind-safe palette (the Okabe–Ito colours).

## 11.2 Other measures

- Contrast, keyboard operation and touch target size follow WCAG 2.2 AA, with touch targets of at least 44 px.
- Plain, short sentences and one term per concept help learners with dyslexia.
- One concept per screen and no timers help learners with ADD/ADHD.
- Students can turn off the confetti in the settings, for example if movement on the screen is distracting.

# 12 Content as JSON for import into the app

All learning content is stored as JSON files. Content writers can change text and examples without touching the code, and the app imports the files at build time. A build-time validator checks every file, for example that every question links to an objective and every wrong option links to a misconception.

## 12.1 Files

| **File** | **Contents** |
|---|---|
| content/conventions.json | Height convention, balance factor formula, case names and fixes, deletion rule. The single source for every label and message. |
| content/lessons/c1.json … c9.json | One file per lesson: its objectives and its screens in order. |
| content/questions/diagnostic.json | The C1 readiness questions. |
| content/questions/checks.json | The lesson check questions (C2 to C8). |
| content/questions/readiness.json | The C9 final questions. |
| content/misconceptions.json | Each misconception with a plain description and a question for the lecture. |
| content/scaffolds.json | The worked example and guided step-through for each skill. |
| content/rewards.json | The four titles (S to C) with their score ranges, the mastery rank, the confetti setting and the certificate fields. |

## 12.2 Rules

- Every object has a unique id, for example c4, c4-s04 or chk6-02.
- Trees are stored as insertion sequences, for example "insert": [10, 20, 30, 40, 50]. The app’s engine builds the tree and works out the answers, so answers are never typed in by hand. Practice and check trees are fixed: every student gets the same trees, written in advance in the content files.
- Every question names its objective (outcomeId), the assessment criteria it covers (criteria, for example LO3.1), its Bloom level (level) and its static hint (hint). Every wrong option names a misconception (misconceptionId) and has its own explanation.
- Each screen records its Gagné event and Merrill phase, so the lesson structure in Section 3.2 can be checked automatically.
- Each answer is saved as an attempt record that includes the attempt number (1, or 2 for a re-attempt on a check), the confidence rating and the number of hints used (hintsUsed).
- Values that are still open are stored as null until the group decides.

## 12.3 Examples

**Conventions file**:

| {<br>"heightOfLeaf": 0,<br>"heightOfEmptyTree": -1,<br>"balanceFactor": "height(right) - height(left)",<br>"validBalanceFactors": [-1, 0, 1],<br>"unbalancedNode": "n",<br>"cases": {<br>"1": { "side": "outside", "insertedInto": "left subtree of n.left",<br>"fix": ["rotateRight(n)"] },<br>"2": { "side": "inside", "insertedInto": "right subtree of n.left",<br>"fix": ["rotateLeft(n.left)", "rotateRight(n)"] },<br>"3": { "side": "inside", "insertedInto": "left subtree of n.right",<br>"fix": ["rotateRight(n.right)", "rotateLeft(n)"] },<br>"4": { "side": "outside", "insertedInto": "right subtree of n.right",<br>"fix": ["rotateLeft(n)"] }<br>},<br>"deletion": "leaf nodes only"<br>} |
|---|

**Lesson file** (part of C4, the search lesson):

| {<br>"id": "c4",<br>"title": "Search (the algorithm)",<br>"outcomeIds": ["LO3"],<br>"screens": [<br>{<br>"id": "c4-s01", "type": "predict",<br>"gagneEvent": 1, "merrillPhase": "problem",<br>"text": "This AVL tree holds 16 keys. What is the most comparisons a search can need?",<br>"tree": { "insert": [3, 2, 1, 4, 5, 6, 7, 16, 15, 14, 13, 12, 11, 10, 8, 9] }<br>},<br>{<br>"id": "c4-s04", "type": "animation",<br>"gagneEvent": 4, "merrillPhase": "demonstration",<br>"representation": "animated-tree",<br>"operation": {<br>"name": "search", "key": 30,<br>"tree": { "insert": [10, 20, 30, 40, 50] }<br>},<br>"pseudocode": "search-loop",<br>"caption": "Compare the key with the node. Smaller: go left. Larger: go right."<br>}<br>],<br>"checkId": "chk4"<br>} |
|---|

**Search question** (LO3; the engine works out the path):

| {<br>"id": "chk4-01",<br>"type": "trace",<br>"outcomeId": "LO3",<br>"criteria": ["LO3.1", "LO3.3"],<br>"subSkill": "trace-search",<br>"level": "apply",<br>"stem": "Search for 35. Click the nodes in the order they are visited.",<br>"hint": "This checks that you can follow a search path: compare the key with the node, then go left or right.",<br>"tree": { "insert": [10, 20, 30, 40, 50] },<br>"searchKey": 35,<br>"answerFrom": "engine",<br>"explanation": "20, then 40, then 30, then an empty right branch: not found."<br>} |
|---|

**Multiple-choice question**:

| {<br>"id": "chk6-02",<br>"type": "mcq",<br>"outcomeId": "LO5",<br>"criteria": ["LO5.3"],<br>"subSkill": "choose-rotation",<br>"level": "apply",<br>"stem": "n has balance factor -2 and n.left has +1. Which rotation(s) fix it?",<br>"hint": "This checks that you can match the shape around n to one of the four cases.",<br>"options": [<br>{ "id": "a",<br>"text": "Left rotation about n.left, then right rotation about n",<br>"explanation": "n leans left and n.left leans right: Case 2 (inside)." },<br>{ "id": "b",<br>"text": "Right rotation about n",<br>"misconceptionId": "misc-single-for-inside",<br>"explanation": "One rotation only fixes the outside cases (1 and 4)." },<br>{ "id": "c",<br>"text": "Right rotation about n.right, then left rotation about n",<br>"misconceptionId": "misc-bf-sign",<br>"explanation": "bf = h(right) - h(left), so -2 means n leans left." }<br>],<br>"correctOptionId": "a"<br>} |
|---|

**Misconception:**

| {<br>"id": "misc-single-for-inside",<br>"description": "Uses a single rotation for an inside case (Case 2 or 3).",<br>"lectureQuestion": "Why does a single rotation not fix the inside cases?"<br>} |
|---|

**Scaffolds for one skill** (worked example and guided step-through, Section 9.4):

| {<br>"subSkill": "choose-rotation",<br>"workedExample": { "insert": [30, 10, 20] },<br>"stepThrough": { "insert": [50, 20, 60, 10, 30, 25] }<br>} |
|---|

**Attempt record** (one per answer, Section 12.2):

| {<br>"questionId": "chk4-01",<br>"attempt": 1,<br>"correct": true,<br>"confidence": "sure",<br>"hintsUsed": 1<br>} |
|---|

**Rewards file:**

| {<br>"titles": [<br>{ "rank": "S", "title": "Structural Savant", "minShare": 1.0, "band": "high" },<br>{ "rank": "A", "title": "AVL Ace", "minShare": 0.66, "band": "high" },<br>{ "rank": "B", "title": "BST Boss", "minShare": 0.5, "band": "middle" },<br>{ "rank": "C", "title": "Complexity Cadet", "minShare": 0, "band": "low" }<br>],<br>"masteryRank": "A",<br>"confetti": { "default": "on", "canTurnOff": true },<br>"certificate": ["studentName", "lessonsCompleted", "title", "date"]<br>} |
|---|

## 12.4 Main fields

| **Field** | **Meaning** |
|---|---|
| outcomeId, criteria | The objective and assessment criteria the item measures (Section 5). |
| level | Bloom level of the item; must match the objective’s Bloom level (Section 5.1). |
| hint | The static hint: what the question assesses and which idea it relies on (Section 9.4). |
| hintsUsed | The number of hints the student opened for a question, saved in the attempt record (Section 9.4). |
| attempt | 1 for the first answer, 2 for the re-attempt on a check question (Section 9.1). |
| subSkill | The small skill used for mastery tracking and routing; also links a question to its worked example and step-through (Section 9). |
| gagneEvent, merrillPhase | Where the screen sits in the lesson structure (Section 3.2). |
| representation | The main representation on the screen (Section 8.1). |
| tree.insert, rebalance | Keys to insert and whether the engine rebalances (false gives a plain BST). |
| misconceptionId | Links a wrong option to its explanation and lecture question. |
| titles | The four titles (S to C), each with its minimum share of criteria met and its routing band, in the rewards file (Sections 9.3 and 10.4). |

# 13 Evaluation plan

Formative evaluation happens during development, to improve the material, and summative evaluation happens at the end. In SAM 2, each “release” is reviewed before the next, so the prototype focuses on formative evaluation:

- A pilot with 3 to 5 peers who have not seen AVL trees, standing in for COS212 students, who cannot be reached before the demonstration. Sessions use think-aloud, with at least one on a phone.
- A short pre-test and post-test on the same objectives (not the in-app questions).
- The System Usability Scale (SUS) questionnaire after the session.
- The app’s anonymous event log: time per lesson, hints opened, retries and the most frequent misconceptions.
- A colour-blindness check of the palette, using the vision-deficiency emulation in Chrome DevTools.

# References

COS212 lecture slides. Complexity Analysis (Chapter 2). Department of Computer Science, University of Pretoria.

COS212 lecture slides. Binary Trees (Chapter 4, BST). Department of Computer Science, University of Pretoria.

COS212 lecture slides. BST: Depth-First Traversals, Insertion and Deletion (Chapter 4). Department of Computer Science, University of Pretoria.

COS212 lecture slides. Binary Search Trees: AVL Trees (Chapter 4). Department of Computer Science, University of Pretoria.

Kumar, A. N., Raj, R. K., Aly, S. G., et al. (2024). Computer Science Curricula 2023. Association for Computing Machinery, New York, NY, USA.

Prof. L. Marshall (2026). COS750 lecture slides: L01, L04 to L07, L09, L11 and L12. Department of Computer Science, University of Pretoria.

Weiss, M. A. (2012). Data Structures and Algorithm Analysis in Java (3rd ed.). Pearson, Boston.

# Appendix A: Assessment descriptors

### LO1: Explain how AVL trees address the inefficiencies of unbalanced BSTs.

| **Criterion** | **Pass descriptor** | **Differentiated descriptors** |
|---|---|---|
| 1. Correctly identifies the problem of unbalanced BSTs. | Identifies that unbalanced BSTs can become skewed, increasing tree height and search time. | **Limited:** Does not identify the effect of imbalance on search efficiency.<br>**Satisfactory:** Identifies that imbalance increases tree height and search time.<br>**Good:** Explains how insertion order can cause imbalance and increase search time.<br>**Excellent:** Clearly connects insertion order, tree height and worst-case O(n) search complexity. |
| 2. Explains how AVL balancing improves search efficiency. | Explains that AVL trees maintain balance to reduce tree height and improve search efficiency. | **Limited:** Provides an incorrect or incomplete explanation of AVL balancing.<br>**Satisfactory:** Explains how maintaining balance improves search efficiency.<br>**Good:** Connects AVL balancing to reduced tree height and fewer search comparisons.<br>**Excellent:** Explains how rotations maintain logarithmic height, ensuring O(log n) worst-case search complexity. |

### LO2: Calculate node heights and balance factors to determine whether a given binary search tree satisfies the AVL balance property.

| **Criterion** | **Pass descriptor** | **Differentiated descriptors** |
|---|---|---|
| 1. Correctly calculates node heights and balance factors. | Correctly calculates node heights and balance factors for a given tree. | **Limited:** Most calculations are incorrect.<br>**Satisfactory:** Correctly calculates heights and balance factors for a simple tree.<br>**Good:** Correctly calculates heights and balance factors across multiple levels.<br>**Excellent:** Accurately calculates all heights and balance factors in complex trees. |
| 2. Identifies all nodes violating the AVL property. | Correctly identifies nodes with balance factors outside the range −1 to +1. | **Limited:** Fails to identify most violations.<br>**Satisfactory:** Identifies violations in a simple tree.<br>**Good:** Correctly identifies all violations in a tree with multiple unbalanced nodes.<br>**Excellent:** Accurately identifies all violations in complex trees, including cases where the root remains balanced. |

### LO3: Trace AVL searches and explain their logarithmic time complexity.

| **Criterion** | **Pass descriptor** | **Differentiated descriptors** |
|---|---|---|
| 1. Follows the correct search path. | Correctly traces the sequence of nodes visited when searching for a given key. | **Limited:** Follows an incorrect search path.<br>**Satisfactory:** Correctly traces a straightforward search path.<br>**Good:** Correctly traces paths requiring multiple comparisons.<br>**Excellent:** Accurately traces complex search paths without unnecessary comparisons. |
| 2. Identifies successful searches. | Correctly determines when a search key is found in the AVL tree. | **Limited:** Incorrectly identifies whether the key was found.<br>**Satisfactory:** Correctly identifies a successful search.<br>**Good:** Correctly identifies the matching node and its search path.<br>**Excellent:** Accurately identifies successful searches across different tree configurations. |
| 3. Identifies unsuccessful searches. | Correctly determines when a search key is absent from the AVL tree. | **Limited:** Incorrectly identifies whether the key is absent.<br>**Satisfactory:** Correctly identifies an unsuccessful search.<br>**Good:** Correctly traces the search until an empty subtree is reached.<br>**Excellent:** Accurately explains why the search terminates without finding the key. |
| 4. Explains how AVL trees maintain O(log n) search complexity. | Explains that AVL trees maintain logarithmic height, limiting the number of comparisons required during a search. | **Limited:** Provides an incorrect or incomplete explanation of search complexity.<br>**Satisfactory:** Connects logarithmic tree height to O(log n) search complexity.<br>**Good:** Explains how balancing limits tree height and search comparisons.<br>**Excellent:** Clearly explains how AVL balancing guarantees O(log n) worst-case search complexity, contrasting it with O(n) in an unbalanced BST. |

### LO4: Identify and perform single or double rotations to restore AVL balance.

| **Criterion** | **Pass descriptor** | **Differentiated descriptors** |
|---|---|---|
| 1. Correctly identifies the unbalanced node. | Identifies the node violating the AVL balance property. | **Limited:** Identifies an incorrect node or fails to recognise the imbalance.<br>**Satisfactory:** Correctly identifies the unbalanced node.<br>**Good:** Identifies the unbalanced node and its balance factor.<br>**Excellent:** Accurately identifies the imbalance and explains its cause. |
| 2. Determines the appropriate rotation (Case 1 to 4 (LL, LR, RL and RR): single or double rotation). | Selects the correct rotation for a given imbalance. | **Limited:** Selects an incorrect rotation.<br>**Satisfactory:** Correctly selects the required rotation.<br>**Good:** Correctly distinguishes between single and double rotations.<br>**Excellent:** Accurately identifies the rotation and explains why it is appropriate for the imbalance. |
| 3. Performs the required rotation(s) correctly. | Performs the appropriate rotation(s) to restore balance. | **Limited:** Performs incorrect rotations or produces an invalid tree.<br>**Satisfactory:** Correctly performs a single or double rotation in a given scenario.<br>**Good:** Correctly performs both single and double rotations across different scenarios.<br>**Excellent:** Accurately performs complex rotation sequences while preserving the tree structure. |
| 4. Independently verifies that the resulting tree satisfies AVL balance and BST ordering properties. | Confirms that the resulting tree is AVL-balanced and maintains BST ordering. | **Limited:** Fails to recognise violations of AVL balance or BST ordering.<br>**Satisfactory:** Correctly verifies balance and BST ordering in a simple tree.<br>**Good:** Correctly verifies both properties across multiple nodes.<br>**Excellent:** Thoroughly verifies both properties in complex trees, including all affected subtrees. |

### LO5: Perform AVL insertions while maintaining the AVL property.

| **Criterion** | **Pass descriptor** | **Differentiated descriptors** |
|---|---|---|
| 1. Correctly inserts nodes according to BST ordering. | Inserts a given key at the correct position according to BST ordering. | **Limited:** Inserts nodes in incorrect positions.<br>**Satisfactory:** Correctly inserts a node into a given tree.<br>**Good:** Correctly inserts multiple nodes while maintaining BST ordering.<br>**Excellent:** Accurately performs successive insertions across different tree configurations. |
| 2. Updates node heights and calculates balance factors correctly. | Correctly updates affected node heights and calculates their balance factors after insertion. | **Limited:** Incorrectly updates heights or calculates balance factors.<br>**Satisfactory:** Correctly updates heights and balance factors for a simple insertion.<br>**Good:** Correctly updates all affected nodes across multiple tree levels.<br>**Excellent:** Accurately updates heights and balance factors during complex insertion sequences. |
| 3. Identifies the lowest unbalanced node and determines the appropriate rotation. | Identifies the lowest unbalanced ancestor and selects the correct rotation. | **Limited:** Fails to identify the correct node or rotation.<br>**Satisfactory:** Correctly identifies the unbalanced node and required rotation.<br>**Good:** Correctly identifies imbalances and rotations across different insertion cases.<br>**Excellent:** Accurately identifies the lowest unbalanced ancestor and determines the appropriate rotation in complex insertion sequences. |
| 4. Performs the necessary rotations to restore AVL balance while preserving BST ordering. | Correctly performs the required rotation(s), producing a valid AVL tree. | **Limited:** Performs incorrect rotations or produces an invalid tree.<br>**Satisfactory:** Correctly rebalances the tree after a simple insertion.<br>**Good:** Correctly handles both single and double rotations following insertion.<br>**Excellent:** Accurately maintains AVL balance and BST ordering throughout successive insertions. |

### LO6: Identify practical applications of AVL trees and justify their suitability.

| **Criterion** | **Pass descriptor** | **Differentiated descriptors** |
|---|---|---|
| 1. Selects appropriate applications of AVL trees. | Correctly identifies practical scenarios where AVL trees would be suitable. | **Limited:** Identifies unsuitable or irrelevant applications.<br>**Satisfactory:** Identifies a suitable application of AVL trees.<br>**Good:** Identifies multiple suitable applications with appropriate characteristics.<br>**Excellent:** Accurately identifies suitable applications across different scenarios, recognising their specific requirements. |
| 2. Explains how AVL properties benefit the selected applications. | Explains how AVL balancing benefits the selected application. | **Limited:** Provides an incorrect or irrelevant justification.<br>**Satisfactory:** Explains how balanced tree height improves search efficiency in the selected application.<br>**Good:** Connects AVL properties to application requirements, such as frequent searches and predictable performance.<br>**Excellent:** Provides a comprehensive justification connecting AVL balancing, O(log n) search complexity and the application's performance requirements. |

### LO7 (minimal): Delete a leaf from an AVL tree and restore the AVL property.

| **Criterion** | **Pass descriptor** | **Differentiated descriptors** |
|---|---|---|
| 1. Correctly removes a leaf while keeping BST ordering. | Removes the given leaf and leaves the rest of the tree in BST order. | **Limited:** Removes the wrong node or breaks the BST ordering.<br>**Satisfactory:** Correctly removes a leaf from a simple tree.<br>**Good:** Correctly removes leaves at different depths and positions in the tree.<br>**Excellent:** Accurately removes leaves in any tree and explains why removing a leaf cannot break the BST ordering. |
| 2. Updates balance factors and identifies any unbalanced node. | Updates the balance factors from the parent of the removed leaf up to the root and identifies any node outside the range −1 to +1. | **Limited:** Does not update the balance factors or misses the unbalanced node.<br>**Satisfactory:** Correctly updates the balance factor of the removed leaf’s parent.<br>**Good:** Updates all balance factors on the path to the root and identifies the unbalanced node.<br>**Excellent:** Accurately updates every affected balance factor and explains why only the nodes on the path to the root can change. |
| 3. Restores balance with a single rotation where one is needed. | Decides whether a rotation is needed and, where it is, performs the correct single rotation. | **Limited:** Rotates when no rotation is needed or chooses the wrong rotation.<br>**Satisfactory:** Performs the correct single rotation when told that one is needed.<br>**Good:** Correctly decides whether a rotation is needed and performs it.<br>**Excellent:** Accurately restores balance and confirms that the resulting tree satisfies both the AVL property and BST ordering. |
