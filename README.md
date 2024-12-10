# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

# テーブル設計

## users テーブル

| Column             | Type   | Options                   |
| ------------------ | ------ | ------------------------- |
| nickname           | string | null: false               |
| email              | string | null: false, unique: true |
| phone_number       | string | null: false               |
| encrypted_password | string | null: false               |
| birthday           | date   | null: false               |

### Association
- has_many :stampcards
- has_many :rewards
- belongs_to:qr_code

## stampcards テーブル

| Column             | Type      | Options                        |
| ------------------ | --------- | ------------------------------ |
| total_stamps       | integer   | null: false                    |
| user               |references | null: false, foreign_key: true |

### Association
- has_many :stamps
- belongs_to:user

## stamps テーブル

| Column             | Type      | Options                        |
| ------------------ | --------- | ------------------------------ |
| stamp_number       | integer   | null: false                    |
| stamp_card         |references | null: false, foreign_key: true |

### Association
- belongs_to:stampcard

## qr_codes テーブル

| Column             | Type      | Options                        |
| ------------------ | --------- | ------------------------------ |
| code               | integer   | null: false                    |

### Association
- has_many :users

## rewards テーブル

| Column             | Type      | Options                        |
| ------------------ | --------- | ------------------------------ |
| reward_type        | string    | null: false                    |
| redeemed_at        | date      | null: false                    |
| user               |references | null: false, foreign_key: true |

### Association
- belongs_to:user