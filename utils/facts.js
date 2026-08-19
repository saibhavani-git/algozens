const FACTS = [
    { title: 'Two pointers', body: 'When a pair or a window of values matters, sorting plus two pointers often beats nested loops — think Two Sum on a sorted array.' },
    { title: 'Hash maps', body: 'If you keep asking “have I seen this before?”, a hash map (or set) usually turns O(n²) scans into O(n) lookups.' },
    { title: 'Prefix sums', body: 'Range-sum questions like “sum from i to j” become O(1) after an O(n) prefix array: prefix[j] − prefix[i−1].' },
    { title: 'Binary search', body: 'Binary search is not only for arrays. If a yes/no answer is monotonic (“too small / too big”), search on the answer itself.' },
    { title: 'Stacks', body: 'Matching brackets, next greater element, and histogram rectangles all hide a stack: last-in decides the next boundary.' },
    { title: 'Linked lists', body: 'Floyd’s cycle detection uses two pointers at 1x and 2x speed. If they meet, there is a loop — O(1) extra space.' },
    { title: 'Recursion vs DP', body: 'If the same subproblem is solved more than once, memoize it. That is the jump from exponential recursion to polynomial DP.' },
    { title: 'BFS vs DFS', body: 'Unweighted shortest path? BFS. Need to explore paths or detect cycles in a graph? DFS (or a visited-color DFS) is the usual tool.' },
    { title: 'Sorting as a trick', body: 'Many “hard” array problems become easy after sorting: meeting rooms, merge intervals, and 3-sum all start that way.' },
    { title: 'Sliding window', body: 'Subarray questions with a constraint like “at most k unique” are often a moving window, not a new nested loop each time.' },
    { title: 'Greedy', body: 'If a local best choice never hurts the global best — interval scheduling, Huffman, jump game — greedy may be optimal.' },
    { title: 'Space trade-off', body: 'O(n) extra memory (a hash set) is a “better” middle step. Interviewers then ask: can you drop it to O(1) with pointers or in-place edits?' },
    { title: 'Master theorem', body: 'Divide-and-conquer recurrences like T(n) = 2T(n/2) + O(n) (merge sort) solve to O(n log n). Count the work per level.' },
    { title: 'In-order BST', body: 'In-order traversal of a binary search tree visits keys in sorted order. That is why kth-smallest in a BST is a tree walk, not a sort.' },
    { title: 'Amortized time', body: 'Array push is O(1) amortized: rare resizes of O(n) are paid for by many cheap inserts. Interviewers love this distinction.' }
];

module.exports = { FACTS };
