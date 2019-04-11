<?php

use yii\helpers\Html;
use yii\web\Response;

/* @var $panel yii\debug\panels\RequestPanel */

$statusCode = $panel->data['statusCode'];
if ($statusCode === null) {
    $statusCode = 200;
}
if ($statusCode >= 200 && $statusCode < 300) {
    $class = 'yii-debug-toolbar__label_success';
} elseif ($statusCode >= 300 && $statusCode < 400) {
    $class = 'yii-debug-toolbar__label_info';
} else {
    $class = 'yii-debug-toolbar__label_important';
}
$statusText = Html::encode(isset(Response::$httpStatuses[$statusCode]) ? Response::$httpStatuses[$statusCode] : '');
$requestTime = date("H:i:s", $panel->data["SERVER"]["REQUEST_TIME"]);
?>
<div class="yii-debug-toolbar__block">
    <a href="<?= $panel->getUrl() ?>" title="Status code: <?= $statusCode ?> <?= $statusText ?>"><span
            class="yii-debug-toolbar__label <?= $class ?>"><?= $statusCode ?></span></a>
    <a href="<?= $panel->getUrl() ?>" title="Request time: <?= $requestTime ?>"><span
            class="yii-debug-toolbar__label"><?= $requestTime ?></span></a>
</div>
