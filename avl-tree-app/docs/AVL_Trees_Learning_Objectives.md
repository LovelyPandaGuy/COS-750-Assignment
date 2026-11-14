<!-- Converted from AVL Trees Learning Objectives.docx (read-only copy; the .docx is the source of truth) -->

**AVL Trees Learning Objectives**

LO1: Explain how AVL trees address the inefficiencies of unbalanced BSTs.

- This outcome focuses specifically on teaching learners the limitations of BSTs that AVL trees were introduced to address

LO2: Calculate node heights and balance factors to determine whether a given binary search tree satisfies the AVL balance property.

- Introductory knowledge of AVL trees, it explains work that tires into the next LO that details an explicit advantage of AVL tree

LO3: Trace AVL searches and explain their logarithmic time complexity.

- Ensures students understand how AVL trees work in practice while also explaining a theoretical advantage of them

LO4: Identify and perform single or double rotations to restore AVL balance.

- Application work

LO5: Perform AVL insertions while maintaining the AVL property.

- Application work

LO6: Identify practical applications of AVL trees and justify their suitability.

- Ensures students can think of real life uses of AVL trees, a demonstration of true understanding of the topic, they can relate the properties of AVL trees to actual uses

Optional (LO7): Perform AVL deletions while maintaining the AVL property.

| **Learning Outcome** | **Assessment Criteria** | **Assessment Approach** |
|---|---|---|
| LO1: Explain how AVL trees address BST inefficiencies. | - Correctly identifies the problem of unbalanced BSTs<br>- Explains how AVL balancing improves search efficiency. | Explanation quality: accuracy, depth and key points covered. |
| LO2: Calculate balance factors and determine whether a tree is AVL-balanced. | - Correctly calculates balance factors<br>- Identifies all nodes violating the AVL property. | Objective correctness. |
| LO3: Trace AVL searches and explain logarithmic complexity. | - Follows the correct search path<br>- Identifies successful searches<br>- Identifies unsuccessful searches<br>- Explains how AVL trees maintain O(log n) search complexity. | Trace correctness and explanation quality. |
| LO4: Identify and perform rotations to restore AVL balance. | - Correctly identifies the unbalanced node.<br>- Determines the appropriate rotation (LL, RR, LR or RL).<br>- Performs the required rotation(s) correctly.<br>- Independently verifies that the resulting tree satisfies AVL balance and BST ordering properties. | Objective correctness. |
| LO5: Perform AVL insertions while maintaining the AVL property. | - Correctly inserts nodes according to BST ordering.<br>- Updates node heights and calculates balance factors correctly.<br>- Identifies the lowest unbalanced node and determines the appropriate rotation.<br>- Performs the necessary rotations to restore AVL balance while preserving BST ordering. | Objective correctness, with partial credit for individual steps. |
| LO6: Identify practical applications of AVL trees and justify their suitability. | - Selects appropriate applications<br>- Explains how AVL properties benefit them. | Relevance, accuracy and justification quality. |

**LO1: Explain how AVL trees address the inefficiencies of unbalanced BSTs.**

| **Assessment Criterion** | **Pass Descriptor** | **Differentiated Descriptors** |
|---|---|---|
| 1. Correctly identifies the problem of unbalanced BSTs. | Identifies that unbalanced BSTs can become skewed, increasing tree height and search time. | Limited: Does not identify the effect of imbalance on search efficiency. Satisfactory: Identifies that imbalance increases tree height and search time. Good: Explains how insertion order can cause imbalance and increase search time. Excellent: Clearly connects insertion order, tree height and worst-case O(n) search complexity. |
| 2. Explains how AVL balancing improves search efficiency. | Explains that AVL trees maintain balance to reduce tree height and improve search efficiency. | Limited: Provides an incorrect or incomplete explanation of AVL balancing. Satisfactory: Explains how maintaining balance improves search efficiency. Good: Connects AVL balancing to reduced tree height and fewer search comparisons. Excellent: Explains how rotations maintain logarithmic height, ensuring O(log n) worst-case search complexity. |

**LO2: Calculate node heights and balance factors to determine whether a given binary search tree satisfies the AVL balance property.**

| **Assessment Criterion** | **Pass Descriptor** | **Differentiated Descriptors** |
|---|---|---|
| 1. Correctly calculates node heights and balance factors. | Correctly calculates node heights and balance factors for a given tree. | Limited: Most calculations are incorrect. Satisfactory: Correctly calculates heights and balance factors for a simple tree. Good: Correctly calculates heights and balance factors across multiple levels. Excellent: Accurately calculates all heights and balance factors in complex trees. |
| 2. Identifies all nodes violating the AVL property. | Correctly identifies nodes with balance factors outside the range −1 to +1. | Limited: Fails to identify most violations. Satisfactory: Identifies violations in a simple tree. Good: Correctly identifies all violations in a tree with multiple unbalanced nodes. Excellent: Accurately identifies all violations in complex trees, including cases where the root remains balanced. |

**LO3: Trace AVL searches and explain their logarithmic time complexity.**

| **Assessment Criterion** | **Pass Descriptor** | **Differentiated Descriptors** |
|---|---|---|
| 1. Follows the correct search path. | Correctly traces the sequence of nodes visited when searching for a given key. | Limited: Follows an incorrect search path. Satisfactory: Correctly traces a straightforward search path. Good: Correctly traces paths requiring multiple comparisons. Excellent: Accurately traces complex search paths without unnecessary comparisons. |
| 2. Identifies successful searches. | Correctly determines when a search key is found in the AVL tree. | Limited: Incorrectly identifies whether the key was found. Satisfactory: Correctly identifies a successful search. Good: Correctly identifies the matching node and its search path. Excellent: Accurately identifies successful searches across different tree configurations. |
| 3. Identifies unsuccessful searches. | Correctly determines when a search key is absent from the AVL tree. | Limited: Incorrectly identifies whether the key is absent. Satisfactory: Correctly identifies an unsuccessful search. Good: Correctly traces the search until an empty subtree is reached. Excellent: Accurately explains why the search terminates without finding the key. |
| 4. Explains how AVL trees maintain O(log n) search complexity. | Explains that AVL trees maintain logarithmic height, limiting the number of comparisons required during a search. | Limited: Provides an incorrect or incomplete explanation of search complexity. Satisfactory: Connects logarithmic tree height to O(log n) search complexity. Good: Explains how balancing limits tree height and search comparisons. Excellent: Clearly explains how AVL balancing guarantees O(log n) worst-case search complexity, contrasting it with O(n) in an unbalanced BST. |

**LO4: Identify and perform single or double rotations to restore AVL balance.**

| **Assessment Criterion** | **Pass Descriptor** | **Differentiated Descriptors** |
|---|---|---|
| 1. Correctly identifies the unbalanced node. | Identifies the node violating the AVL balance property. | Limited: Identifies an incorrect node or fails to recognise the imbalance. Satisfactory: Correctly identifies the unbalanced node. Good: Identifies the unbalanced node and its balance factor. Excellent: Accurately identifies the imbalance and explains its cause. |
| 2. Determines the appropriate rotation (LL, RR, LR or RL). | Selects the correct rotation for a given imbalance. | Limited: Selects an incorrect rotation. FSatisfactory: Correctly selects the required rotation. Good: Correctly distinguishes between single and double rotations. Excellent: Accurately identifies the rotation and explains why it is appropriate for the imbalance. |
| 3. Performs the required rotation(s) correctly. | Performs the appropriate rotation(s) to restore balance. | Limited: Performs incorrect rotations or produces an invalid tree. Satisfactory: Correctly performs a single or double rotation in a given scenario. Good: Correctly performs both single and double rotations across different scenarios. Excellent: Accurately performs complex rotation sequences while preserving the tree structure. |
| 4. Independently verifies that the resulting tree satisfies AVL balance and BST ordering properties. | Confirms that the resulting tree is AVL-balanced and maintains BST ordering. | Limited: Fails to recognise violations of AVL balance or BST ordering. Satisfactory: Correctly verifies balance and BST ordering in a simple tree. Good: Correctly verifies both properties across multiple nodes. Excellent: Thoroughly verifies both properties in complex trees, including all affected subtrees. |

**LO5: Perform AVL insertions while maintaining the AVL property.**

| **Assessment Criterion** | **Pass Descriptor** | **Differentiated Descriptors** |
|---|---|---|
| 1. Correctly inserts nodes according to BST ordering. | Inserts a given key at the correct position according to BST ordering. | Limited: Inserts nodes in incorrect positions. Satisfactory: Correctly inserts a node into a given tree. Good: Correctly inserts multiple nodes while maintaining BST ordering. Excellent: Accurately performs successive insertions across different tree configurations. |
| 2. Updates node heights and calculates balance factors correctly. | Correctly updates affected node heights and calculates their balance factors after insertion. | Limited: Incorrectly updates heights or calculates balance factors. Satisfactory: Correctly updates heights and balance factors for a simple insertion. Good: Correctly updates all affected nodes across multiple tree levels. Excellent: Accurately updates heights and balance factors during complex insertion sequences. |
| 3. Identifies the lowest unbalanced node and determines the appropriate rotation. | Identifies the lowest unbalanced ancestor and selects the correct rotation. | Limited: Fails to identify the correct node or rotation. Satisfactory: Correctly identifies the unbalanced node and required rotation. Good: Correctly identifies imbalances and rotations across different insertion cases. Excellent: Accurately identifies the lowest unbalanced ancestor and determines the appropriate rotation in complex insertion sequences. |
| 4. Performs the necessary rotations to restore AVL balance while preserving BST ordering. | Correctly performs the required rotation(s), producing a valid AVL tree. | Limited: Performs incorrect rotations or produces an invalid tree. Satisfactory: Correctly rebalances the tree after a simple insertion. Good: Correctly handles both single and double rotations following insertion. Excellent: Accurately maintains AVL balance and BST ordering throughout successive insertions. |

**LO6: Identify practical applications of AVL trees and justify their suitability.**

| **Assessment Criterion** | **Pass Descriptor** | **Differentiated Descriptors** |
|---|---|---|
| 1. Selects appropriate applications of AVL trees. | Correctly identifies practical scenarios where AVL trees would be suitable. | Limited: Identifies unsuitable or irrelevant applications. Satisfactory: Identifies a suitable application of AVL trees. Good: Identifies multiple suitable applications with appropriate characteristics. Excellent: Accurately identifies suitable applications across different scenarios, recognising their specific requirements. |
| 2. Explains how AVL properties benefit the selected applications. | Explains how AVL balancing benefits the selected application. | Limited: Provides an incorrect or irrelevant justification. Satisfactory: Explains how balanced tree height improves search efficiency in the selected application. Good: Connects AVL properties to application requirements, such as frequent searches and predictable performance. Excellent: Provides a comprehensive justification connecting AVL balancing, O(log n) search complexity and the application's performance requirements. |
