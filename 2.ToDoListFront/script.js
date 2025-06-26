/**
 * Dynamic To-Do List Application
 * A modern, feature-rich todo list with filtering, statistics, and persistence
 */

class TodoApp {
    constructor() {
        // Initialize application state
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        
        // Set up the application
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    /*
     * Initialize DOM element references
     */
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }

    /**
     * Attach event listeners to DOM elements
     */
    attachEventListeners() {
        // Add task button click
        this.addBtn.addEventListener('click', () => this.addTask());
        
        // Add task on Enter key press
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Filter button clicks
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => this.saveTasks());
    }

    /**
     * Add a new task to the list
     */
    addTask() {
        const text = this.taskInput.value.trim();
        
        // Validate input
        if (!text) {
            this.taskInput.focus();
            return;
        }

        // Create new task object
        const task = {
            id: Date.now(), // Simple unique ID using timestamp
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        // Add to beginning of tasks array
        this.tasks.unshift(task);
        
        // Clear input and refocus
        this.taskInput.value = '';
        this.taskInput.focus();
        
        // Save and re-render
        this.saveTasks();
        this.render();
    }

    /**
     * Toggle a task's completion status
     * @param {number} id - Task ID to toggle
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Delete a task from the list
     * @param {number} id - Task ID to delete
     */
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Set the current filter and update UI
     * @param {string} filter - Filter type: 'all', 'pending', or 'completed'
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    /**
     * Get tasks based on current filter
     * @returns {Array} Filtered tasks array
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            default:
                return this.tasks;
        }
    }

    /**
     * Update the statistics display
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = `Total: ${total}`;
        this.completedTasks.textContent = `Completed: ${completed}`;
        this.pendingTasks.textContent = `Pending: ${pending}`;
    }

    /**
     * Render the todo list and update all UI elements
     */
    render() {
        const filteredTasks = this.getFilteredTasks();
        this.todoList.innerHTML = '';

        if (filteredTasks.length === 0) {
            // Show empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = this.currentFilter === 'all' 
                ? 'No tasks yet. Add one above!' 
                : `No ${this.currentFilter} tasks.`;
            this.todoList.appendChild(emptyState);
        } else {
            // Render each task
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `todo-item ${task.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="todo-text">${this.escapeHtml(task.text)}</span>
                    <span class="todo-date">${task.createdAt}</span>
                    <button class="delete-btn" title="Delete task">×</button>
                `;

                // Attach event listeners to task elements
                const checkbox = li.querySelector('.todo-checkbox');
                const deleteBtn = li.querySelector('.delete-btn');

                checkbox.addEventListener('change', () => this.toggleTask(task.id));
                deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

                this.todoList.appendChild(li);
            });
        }

        // Update statistics
        this.updateStats();
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Save tasks to localStorage
     * Note: In the Claude.ai artifact environment, this uses in-memory storage
     */
    saveTasks() {
        // Using in-memory storage only - tasks will persist during the session
        // In a real application, you would use localStorage here:
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (e) {
            // Fallback for environments where localStorage is not available
            console.log('localStorage not available, using session storage');
        }
    }

    /**
     * Load tasks from localStorage
     * @returns {Array} Array of tasks or empty array if none found
     */
    loadTasks() {
        // Using in-memory storage - returns empty array for new sessions
        // In a real application, you would load from localStorage here:
        try {
            const saved = localStorage.getItem('todoTasks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            // Fallback for environments where localStorage is not available
            console.log('localStorage not available, starting with empty task list');
            return [];
        }
    }

    /**
     * Clear all tasks (utility method)
     */
    clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks?')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Clear completed tasks (utility method)
     */
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear.');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    /**
     * Get application statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

        return {
            total,
            completed,
            pending,
            completionRate: `${completionRate}%`
        };
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance for debugging (optional)
    window.todoApp = new TodoApp();
    
    // Log initialization
    console.log('Todo App initialized successfully!');
    console.log('Available methods: todoApp.clearAllTasks(), todoApp.clearCompletedTasks(), todoApp.getStats()');
});