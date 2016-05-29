<?php
/* @var $panel yii\debug\panels\ConfigPanel */
?>
<div class="yii-debug-toolbar__block">
    <a href="<?= $panel->getUrl() ?>">
        <span class="yii-debug-toolbar__label"><?= $panel->data['application']['yii'] ?></span>
        <span class="yii-debug-toolbar__label"><?= substr($panel->data['php']['version'], 0, 10) ?></span>
    </a>
</div>
