const mongoose = require('mongoose');
const Question = require('../models/questions');

mongoose.connect('mongodb://127.0.0.1:27017/dsa-platform');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const questions = [
    // arrays
    {
        title: 'Two Sum',
        category: 'arrays',
        description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. Assume exactly one solution exists and you may not use the same element twice.',
        inputFormat: 'First line: space-separated integers representing the array.\nSecond line: integer target.',
        outputFormat: 'Two space-separated indices of the pair that sums to target.',
        testCases: [
            { input: '2 7 11 15\n9', expectedOutput: '0 1' },
            { input: '3 2 4\n6', expectedOutput: '1 2' }
        ]
    },
    {
        title: 'Move Zeroes',
        category: 'arrays',
        description: 'Move all zeroes to the end of the array while preserving the relative order of the non-zero elements. Perform the operation in-place.',
        inputFormat: 'A single line of space-separated integers.',
        outputFormat: 'The modified array as space-separated integers.',
        testCases: [
            { input: '0 1 0 3 12', expectedOutput: '1 3 12 0 0' },
            { input: '0 0 1', expectedOutput: '1 0 0' }
        ]
    },
    {
        title: 'Kadane’s Algorithm',
        category: 'arrays',
        description: 'Find the contiguous subarray (containing at least one number) which has the largest sum, and return that sum.',
        inputFormat: 'A single line of space-separated integers.',
        outputFormat: 'A single integer — the maximum subarray sum.',
        testCases: [
            { input: '1 2 3 -2 5', expectedOutput: '9' },
            { input: '-1 -2 -3 -4', expectedOutput: '-1' }
        ]
    },
    {
        title: 'Contains Duplicate',
        category: 'arrays',
        description: 'Given an integer array, return true if any value appears at least twice, and false if every element is distinct.',
        inputFormat: 'A single line of space-separated integers.',
        outputFormat: 'true or false',
        testCases: [
            { input: '1 2 3 1', expectedOutput: 'true' },
            { input: '1 2 3 4', expectedOutput: 'false' }
        ]
    },
    // linked-list
    {
        title: 'Detect Loop in Linked List',
        category: 'linked-list',
        description: 'Given the head of a singly linked list, determine whether the list contains a cycle. A cycle exists if some node can be reached again by continuously following the next pointer.',
        inputFormat: 'First line: space-separated node values.\nSecond line: index (0-based) where the tail connects, or -1 if there is no cycle.',
        outputFormat: 'true or false',
        testCases: [
            { input: '1 2 3 4\n1', expectedOutput: 'true' },
            { input: '1 2 3 4\n-1', expectedOutput: 'false' }
        ]
    },
    {
        title: 'Merge Two Sorted Lists',
        category: 'linked-list',
        description: 'Merge two sorted linked lists and return it as a new sorted list. The new list should be made by splicing together the nodes of the first two lists.',
        inputFormat: 'First line: space-separated values of list 1 (empty line if empty).\nSecond line: space-separated values of list 2.',
        outputFormat: 'Space-separated values of the merged sorted list.',
        testCases: [
            { input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4' },
            { input: '\n0', expectedOutput: '0' }
        ]
    },
    {
        title: 'Reverse Linked List',
        category: 'linked-list',
        description: 'Reverse a singly linked list and return the new head. You may reverse it iteratively or recursively.',
        inputFormat: 'A single line of space-separated node values.',
        outputFormat: 'Space-separated values of the reversed list.',
        testCases: [
            { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1' },
            { input: '1 2', expectedOutput: '2 1' }
        ]
    },
    {
        title: 'Middle of the Linked List',
        category: 'linked-list',
        description: 'Given the head of a singly linked list, return the value of the middle node. If there are two middle nodes, return the second middle node.',
        inputFormat: 'A single line of space-separated node values.',
        outputFormat: 'The value of the middle node.',
        testCases: [
            { input: '1 2 3 4 5', expectedOutput: '3' },
            { input: '1 2 3 4 5 6', expectedOutput: '4' }
        ]
    },
    // searching
    {
        title: 'First and Last Position',
        category: 'searching',
        description: 'Given a sorted array of integers and a target value, find the starting and ending position of the target. If the target is not found, return -1 -1. Aim for O(log n) time.',
        inputFormat: 'First line: space-separated sorted integers.\nSecond line: integer target.',
        outputFormat: 'Two space-separated indices (start and end), or -1 -1.',
        testCases: [
            { input: '5 7 7 8 8 10\n8', expectedOutput: '3 4' },
            { input: '5 7 7 8 8 10\n6', expectedOutput: '-1 -1' }
        ]
    },
    {
        title: 'Square Root of Integer',
        category: 'searching',
        description: 'Given a non-negative integer x, return the square root of x rounded down to the nearest integer. You may not use built-in exponent functions. Use binary search.',
        inputFormat: 'A single non-negative integer x.',
        outputFormat: 'The floor of the square root of x.',
        testCases: [
            { input: '4', expectedOutput: '2' },
            { input: '8', expectedOutput: '2' }
        ]
    },
    {
        title: 'Binary Search',
        category: 'searching',
        description: 'Given a sorted array of integers and a target, return the index of the target if it exists, otherwise return -1.',
        inputFormat: 'First line: space-separated sorted integers.\nSecond line: integer target.',
        outputFormat: 'A single integer — the index of the target, or -1.',
        testCases: [
            { input: '-1 0 3 5 9 12\n9', expectedOutput: '4' },
            { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1' }
        ]
    },
    {
        title: 'Search in Rotated Sorted Array',
        category: 'searching',
        description: 'An array sorted in ascending order is rotated at an unknown pivot. Given the rotated array and a target, return the index of the target, or -1 if it is not present. Aim for O(log n).',
        inputFormat: 'First line: space-separated integers of the rotated array.\nSecond line: integer target.',
        outputFormat: 'Index of the target, or -1.',
        testCases: [
            { input: '4 5 6 7 0 1 2\n0', expectedOutput: '4' },
            { input: '4 5 6 7 0 1 2\n3', expectedOutput: '-1' }
        ]
    },
    // sorting
    {
        title: 'Quick Sort',
        category: 'sorting',
        description: 'Sort an array of integers in non-decreasing order using the Quick Sort algorithm and return the sorted array.',
        inputFormat: 'A single line of space-separated integers.',
        outputFormat: 'The sorted array as space-separated integers.',
        testCases: [
            { input: '10 7 8 9 1 5', expectedOutput: '1 5 7 8 9 10' },
            { input: '4 2 6 9 2', expectedOutput: '2 2 4 6 9' }
        ]
    },
    {
        title: 'Insertion Sort',
        category: 'sorting',
        description: 'Sort an array of integers in non-decreasing order using Insertion Sort and return the sorted array.',
        inputFormat: 'A single line of space-separated integers.',
        outputFormat: 'The sorted array as space-separated integers.',
        testCases: [
            { input: '12 11 13 5 6', expectedOutput: '5 6 11 12 13' },
            { input: '4 3 2 10 12 1 5 6', expectedOutput: '1 2 3 4 5 6 10 12' }
        ]
    },
    {
        title: 'Merge Sort',
        category: 'sorting',
        description: 'Sort an array of integers in non-decreasing order using Merge Sort (divide and conquer) and return the sorted array.',
        inputFormat: 'A single line of space-separated integers.',
        outputFormat: 'The sorted array as space-separated integers.',
        testCases: [
            { input: '38 27 43 3 9 82 10', expectedOutput: '3 9 10 27 38 43 82' },
            { input: '5 1 1 2 0 0', expectedOutput: '0 0 1 1 2 5' }
        ]
    },
    {
        title: 'Sort Colors',
        category: 'sorting',
        description: 'Given an array with n objects colored red (0), white (1), or blue (2), sort them in-place so that objects of the same color are adjacent, in the order 0, 1, 2. Do not use the library sort function.',
        inputFormat: 'A single line of space-separated integers, each 0, 1, or 2.',
        outputFormat: 'The sorted array as space-separated integers.',
        testCases: [
            { input: '2 0 2 1 1 0', expectedOutput: '0 0 1 1 2 2' },
            { input: '2 0 1', expectedOutput: '0 1 2' }
        ]
    },
    // dynamic-programming
    {
        title: 'Fibonacci Number',
        category: 'dynamic-programming',
        description: 'The Fibonacci sequence is defined as F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1. Given n, return F(n) using dynamic programming.',
        inputFormat: 'A single integer n (0 <= n <= 30).',
        outputFormat: 'The nth Fibonacci number.',
        testCases: [
            { input: '5', expectedOutput: '5' },
            { input: '10', expectedOutput: '55' }
        ]
    },
    {
        title: 'Longest Common Subsequence',
        category: 'dynamic-programming',
        description: 'Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence that appears in the same relative order, but not necessarily contiguous.',
        inputFormat: 'First line: string text1.\nSecond line: string text2.',
        outputFormat: 'An integer — the length of the LCS.',
        testCases: [
            { input: 'abcde\nace', expectedOutput: '3' },
            { input: 'abc\nabc', expectedOutput: '3' }
        ]
    },
    {
        title: 'Climbing Stairs',
        category: 'dynamic-programming',
        description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. Return the number of distinct ways to reach the top.',
        inputFormat: 'A single integer n.',
        outputFormat: 'The number of distinct ways.',
        testCases: [
            { input: '2', expectedOutput: '2' },
            { input: '3', expectedOutput: '3' }
        ]
    },
    {
        title: 'Coin Change',
        category: 'dynamic-programming',
        description: 'You are given coins of different denominations and a total amount. Return the fewest number of coins needed to make up that amount. If it cannot be made, return -1.',
        inputFormat: 'First line: space-separated coin denominations.\nSecond line: integer amount.',
        outputFormat: 'The minimum number of coins, or -1.',
        testCases: [
            { input: '1 2 5\n11', expectedOutput: '3' },
            { input: '2\n3', expectedOutput: '-1' }
        ]
    },
    // graphs
    {
        title: 'Detect Cycle in Undirected Graph',
        category: 'graphs',
        description: 'Given an undirected graph with n nodes labeled 0 to n-1 and a list of edges, return true if the graph contains a cycle, otherwise false.',
        inputFormat: 'First line: integers n and e (nodes and edges).\nNext e lines: two integers u v representing an undirected edge.',
        outputFormat: 'true or false',
        testCases: [
            { input: '3 3\n0 1\n1 2\n2 0', expectedOutput: 'true' },
            { input: '4 3\n0 1\n1 2\n2 3', expectedOutput: 'false' }
        ]
    },
    {
        title: 'Topological Sort',
        category: 'graphs',
        description: 'Given a directed acyclic graph (DAG) with n nodes labeled 0 to n-1, return a valid topological ordering of the nodes. If multiple orders exist, any valid one is accepted in practice; use the sample outputs as the expected order.',
        inputFormat: 'First line: integers n and e.\nNext e lines: two integers u v meaning a directed edge u -> v.',
        outputFormat: 'Space-separated node order.',
        testCases: [
            { input: '6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1', expectedOutput: '4 5 2 0 3 1' },
            { input: '4 3\n0 1\n1 2\n2 3', expectedOutput: '0 1 2 3' }
        ]
    },
    {
        title: 'Number of Islands',
        category: 'graphs',
        description: 'Given an m x n 2D grid of 1s (land) and 0s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
        inputFormat: 'First line: integers m and n.\nNext m lines: n space-separated 0s and 1s.',
        outputFormat: 'A single integer — the number of islands.',
        testCases: [
            { input: '4 5\n1 1 1 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expectedOutput: '3' },
            { input: '1 1\n0', expectedOutput: '0' }
        ]
    },
    {
        title: 'BFS Shortest Path',
        category: 'graphs',
        description: 'Given an unweighted undirected graph, a source node, and a destination node, return the length of the shortest path from source to destination. If no path exists, return -1.',
        inputFormat: 'First line: integers n and e.\nNext e lines: undirected edges u v.\nLast line: source and destination.',
        outputFormat: 'An integer — the shortest path length, or -1.',
        testCases: [
            { input: '4 4\n0 1\n1 2\n2 3\n0 3\n0 3', expectedOutput: '1' },
            { input: '3 1\n0 1\n0 2', expectedOutput: '-1' }
        ]
    },
    // other
    {
        title: 'Palindrome Check',
        category: 'other',
        description: 'Given a string s, return true if it is a palindrome, considering only alphanumeric characters and ignoring case.',
        inputFormat: 'A single string s.',
        outputFormat: 'true or false',
        testCases: [
            { input: 'racecar', expectedOutput: 'true' },
            { input: 'hello', expectedOutput: 'false' }
        ]
    },
    {
        title: 'Anagram Check',
        category: 'other',
        description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses the same characters with the same frequencies.',
        inputFormat: 'First line: string s.\nSecond line: string t.',
        outputFormat: 'true or false',
        testCases: [
            { input: 'listen\nsilent', expectedOutput: 'true' },
            { input: 'hello\nworld', expectedOutput: 'false' }
        ]
    },
    {
        title: 'Valid Parentheses',
        category: 'other',
        description: 'Given a string containing only the characters (, ), {, }, [ and ], determine if the input string is valid. Open brackets must be closed by the same type of brackets, in the correct order.',
        inputFormat: 'A single string of brackets.',
        outputFormat: 'true or false',
        testCases: [
            { input: '()[]{}', expectedOutput: 'true' },
            { input: '(]', expectedOutput: 'false' }
        ]
    },
    {
        title: 'Min Stack',
        category: 'other',
        description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Process a sequence of operations and print the results of top/getMin queries.',
        inputFormat: 'First line: integer q (number of operations).\nNext q lines: operations of the form PUSH x, POP, TOP, or MIN.',
        outputFormat: 'One line per TOP or MIN operation with the resulting value, or EMPTY if the stack is empty.',
        testCases: [
            { input: '7\nPUSH 2\nPUSH 0\nPUSH 3\nMIN\nPOP\nTOP\nMIN', expectedOutput: '0\n0\n0' },
            { input: '3\nPUSH 1\nPOP\nMIN', expectedOutput: 'EMPTY' }
        ]
    }
];

const seedQuestions = async () => {
    try {
        for (const q of questions) {
            await Question.updateOne(
                { title: q.title, category: q.category },
                { $set: q },
                { upsert: true }
            );
        }
        const count = await Question.countDocuments();
        console.log(`Seed complete. ${questions.length} questions upserted. Collection now has ${count} documents.`);
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await mongoose.connection.close();
    }
};

seedQuestions();
