// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "CREATE TABLE orders (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	createdAt TEXT NOT NULL,
	finishedAt TEXT,
	totalPrice NUMERIC NOT NULL
);
CREATE TABLE orderItems (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	\"order\" INTEGER NOT NULL,
	itemId TEXT NOT NULL,
	variantId TEXT,
	amount INTEGER NOT NULL,
	singlePrice NUMERIC NOT NULL,
	totalPrice NUMERIC NOT NULL,
	name TEXT,
    CONSTRAINT orderItems_orders_FK FOREIGN KEY (\"order\") REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE
);",
            kind: MigrationKind::Up,
        }
    ];

    app_lib::run(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:cashdesk.db", migrations),
    );
}
