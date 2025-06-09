const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/dsa-platform');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const Question=require('../models/questions')
const seedQuestions = async () => {
    try {
        await Question.deleteMany({}); // Clear existing questions

        const questions = [
            {
                title: "Palindrome Check",
                category: "other",
                description: "Check if a string is a palindrome.",
                inputFormat: "A string",
                outputFormat: "true or false",
                testCases: [
                    { input: "\"racecar\"", expectedOutput: "true" },
                    { input: "\"hello\"", expectedOutput: "false" }
                ]
            },
            {
                title: "Anagram Check",
                category: "other",
                description: "Check if two strings are anagrams.",
                inputFormat: "Two strings",
                outputFormat: "true or false",
                testCases: [
                    { input: "\"listen\", \"silent\"", expectedOutput: "true" },
                    { input: "\"hello\", \"world\"", expectedOutput: "false" }
                ]
            },
            {
                title: "Valid Parentheses",
                category: "other",
                description: "Check if the parentheses string is valid.",
                inputFormat: "String of parentheses",
                outputFormat: "true or false",
                testCases: [
                    { input: "\"()[]{}\"", expectedOutput: "true" },
                    { input: "\"(]\"", expectedOutput: "false" }
                ]
            },
            {
                title: "Detect Cycle in Undirected Graph",
                category: "graphs",
                description: "Check if there is a cycle in an undirected graph.",
                inputFormat: "Graph in adjacency list format",
                outputFormat: "true or false",
                testCases: [
                    { input: "{0:[1],1:[2],2:[0]}", expectedOutput: "true" },
                    { input: "{0:[1],1:[2],2:[3]}", expectedOutput: "false" }
                ]
            },
            {
                title: "Topological Sort",
                category: "graphs",
                description: "Return a topological sort of a DAG.",
                inputFormat: "Directed acyclic graph (DAG)",
                outputFormat: "Topologically sorted order",
                testCases: [
                    { input: "{5:[2,0],4:[0,1],2:[],3:[1],1:[],0:[]}", expectedOutput: "[4,5,2,0,3,1]" },
                    { input: "{0:[1],1:[2],2:[3],3:[]}", expectedOutput: "[0,1,2,3]" }
                ]
            },
            {
                title: "Fibonacci Number",
                category: "dynamic-programming",
                description: "Return the nth Fibonacci number using DP.",
                inputFormat: "Integer n",
                outputFormat: "nth Fibonacci number",
                testCases: [
                    { input: "5", expectedOutput: "5" },
                    { input: "10", expectedOutput: "55" }
                ]
            },
            {
                title: "Longest Common Subsequence",
                category: "dynamic-programming",
                description: "Find the length of LCS between two strings.",
                inputFormat: "Two strings",
                outputFormat: "Length of longest common subsequence",
                testCases: [
                    { input: "\"abcde\", \"ace\"", expectedOutput: "3" },
                    { input: "\"abc\", \"abc\"", expectedOutput: "3" }
                ]
            },
            {
                title: "Quick Sort",
                category: "sorting",
                description: "Sort an array using quick sort algorithm.",
                inputFormat: "Unsorted array",
                outputFormat: "Sorted array",
                testCases: [
                    { input: "[10,7,8,9,1,5]", expectedOutput: "[1,5,7,8,9,10]" },
                    { input: "[4,2,6,9,2]", expectedOutput: "[2,2,4,6,9]" }
                ]
            },
            {
                title: "Insertion Sort",
                category: "sorting",
                description: "Sort an array using insertion sort algorithm.",
                inputFormat: "Unsorted array",
                outputFormat: "Sorted array",
                testCases: [
                    { input: "[12, 11, 13, 5, 6]", expectedOutput: "[5,6,11,12,13]" },
                    { input: "[4,3,2,10,12,1,5,6]", expectedOutput: "[1,2,3,4,5,6,10,12]" }
                ]
            },
            {
                title: "First and Last Position",
                category: "searching",
                description: "Find first and last position of a target in a sorted array.",
                inputFormat: "Sorted array and a target",
                outputFormat: "Array with start and end index",
                testCases: [
                    { input: "[5,7,7,8,8,10], 8", expectedOutput: "[3,4]" },
                    { input: "[5,7,7,8,8,10], 6", expectedOutput: "[-1,-1]" }
                ]
            },
            {
                title: "Square Root of Integer",
                category: "searching",
                description: "Find the square root of a number using binary search.",
                inputFormat: "Integer x",
                outputFormat: "Square root (floor)",
                testCases: [
                    { input: "4", expectedOutput: "2" },
                    { input: "8", expectedOutput: "2" }
                ]
            },
            {
                title: "Detect Loop in Linked List",
                category: "linked-list",
                description: "Detect if a linked list contains a cycle.",
                inputFormat: "Head of a singly linked list",
                outputFormat: "true or false",
                testCases: [
                    { input: "[1,2,3,4] with loop at 2", expectedOutput: "true" },
                    { input: "[1,2,3,4]", expectedOutput: "false" }
                ]
            },
            {
                title: "Merge Two Sorted Lists",
                category: "linked-list",
                description: "Merge two sorted linked lists into one sorted list.",
                inputFormat: "Two sorted linked lists",
                outputFormat: "A single merged sorted list",
                testCases: [
                    { input: "[1,2,4], [1,3,4]", expectedOutput: "[1,1,2,3,4,4]" },
                    { input: "[], [0]", expectedOutput: "[0]" }
                ]
            },
            {
                title: "Two Sum",
                category: "arrays",
                description: "Find indices of two numbers such that they add up to a target.",
                inputFormat: "Array of integers and a target",
                outputFormat: "Indices of the two numbers",
                testCases: [
                    { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
                    { input: "[3,2,4], 6", expectedOutput: "[1,2]" }
                ]
            },
            {
                title: "Move Zeroes",
                category: "arrays",
                description: "Move all zeroes to the end without changing the order of non-zero elements.",
                inputFormat: "Array of integers",
                outputFormat: "Modified array",
                testCases: [
                    { input: "[0,1,0,3,12]", expectedOutput: "[1,3,12,0,0]" },
                    { input: "[0,0,1]", expectedOutput: "[1,0,0]" }
                ]
            },
            {
                title: "Kadane’s Algorithm",
                category: "arrays",
                description: "Find the maximum subarray sum.",
                inputFormat: "Array of integers",
                outputFormat: "Maximum sum",
                testCases: [
                    { input: "[1,2,3,-2,5]", expectedOutput: "9" },
                    { input: "[-1,-2,-3,-4]", expectedOutput: "-1" }
                ]
            }
                                                                                    
        ];

        await Question.insertMany(questions);
        console.log("✅ Database seeded successfully!");

        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error seeding database:", err);
        mongoose.connection.close();
    }
};

seedQuestions();

