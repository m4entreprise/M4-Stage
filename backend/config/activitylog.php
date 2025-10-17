<?php

return [
    'default_log_name' => env('ACTIVITY_LOG_NAME', 'default'),
    'table_name' => 'activity_log',
    'database_connection' => env('ACTIVITY_LOGGER_DB_CONNECTION'),
    'console_logging_enabled' => env('ACTIVITY_LOGGER_ENABLE_CONSOLE_LOGGING', false),

    'subject_returns_soft_deleted_models' => false,
    'submit_empty_logs' => false,

    'activity_model' => App\Models\ActivityLog::class,

    'logger' => Spatie\Activitylog\ActivityLogger::class,

    'default_auth_driver' => null,

    'log_when_attributes_changed_only' => true,

    'performed_on_queue' => env('ACTIVITY_LOGGER_PERFORMED_ON_QUEUE'),
];
