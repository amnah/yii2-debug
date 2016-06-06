# yii2-debug

This is an improved version of the official [yii2-debug](https://github.com/yiisoft/yii2-debug) module.

The main benefit of this version is that it captures ajax calls and updates the debugbar accordingly. Additionally, the main common panels are more compact.

## Installation:

Install package via composer ```"amnah/yii2-debug": "dev-master"```

## Usage:

```php
if (YII_ENV_DEV) {
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'amnah\yii2\debug\Module',
        'allowedIPs' => ['*'],
        'limitToCurrentRequest' =>  true, // set this to false if you want it to show all requests in history
                                          // which by default is 50 items (yii2-debug Module::$historySize)
    ];
}
```

## Demo image:

![demo](demo.png "demo")
