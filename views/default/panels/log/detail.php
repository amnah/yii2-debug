<?php
/* @var $panel yii\debug\panels\LogPanel */
/* @var $searchModel yii\debug\models\search\Log */
/* @var $dataProvider yii\data\ArrayDataProvider */

use yii\helpers\Html;
use yii\grid\GridView;
use yii\helpers\VarDumper;
use yii\log\Logger;

?>
<h1>Log Messages</h1>
<?php

// calculate duration between log items
foreach ($dataProvider->allModels as $k => $model) {
    // check if we're at the last model. if so, set 0 and break
    if (!isset($dataProvider->allModels[$k+1])) {
        $dataProvider->allModels[$k]["diff"] = 0;
        break;
    }

    // compute diff in milliseconds
    $diff = $dataProvider->allModels[$k+1]["time"] - $dataProvider->allModels[$k]["time"];
    $dataProvider->allModels[$k]["diff"] = $diff;
}

echo GridView::widget([
    'dataProvider' => $dataProvider,
    'id' => 'log-panel-detailed-grid',
    'options' => ['class' => 'detail-grid-view table-responsive'],
    'filterModel' => $searchModel,
    'filterUrl' => $panel->getUrl(),
    'rowOptions' => function ($model, $key, $index, $grid) {
        switch ($model['level']) {
            case Logger::LEVEL_ERROR : return ['class' => 'danger'];
            case Logger::LEVEL_WARNING : return ['class' => 'warning'];
            case Logger::LEVEL_INFO : return ['class' => 'success'];
            default: return [];
        }
    },
    'columns' => [
        ['class' => 'yii\grid\SerialColumn'],
        [
            'attribute' => 'time',
            'value' => function ($data) {
                // compute time of evaluation
                $timeInSeconds = $data['time'] / 1000;
                $millisecondsDiff = (int) (($timeInSeconds - (int) $timeInSeconds) * 1000);
                $value = date('H:i:s.', $timeInSeconds) . sprintf('%03d', $millisecondsDiff);

                // format diff times
                $suffix = "ms";
                $diff = (float)$data["diff"];
                if ($diff > 1000) {
                    $suffix = "s";
                    $diff = $diff / 1000;
                } elseif ($diff < 1) {
                    $suffix = "&micro;s";
                    $diff = $diff * 1000;
                }
                $diff = sprintf("%.2f", $diff);

                return "$value <ul class='trace'><li>$diff $suffix</li></ul>";
            },
            'format' => 'raw',
            'headerOptions' => [
                'class' => 'sort-numerical'
            ]
        ],
        [
            'attribute' => 'level',
            'value' => function ($data) {
                return Logger::getLevelName($data['level']);
            },
            'filter' => [
                Logger::LEVEL_TRACE => ' Trace ',
                Logger::LEVEL_INFO => ' Info ',
                Logger::LEVEL_WARNING => ' Warning ',
                Logger::LEVEL_ERROR => ' Error ',
            ],
        ],
        'category',
        [
            'attribute' => 'message',
            'value' => function ($data) {
                $message = Html::encode(is_string($data['message']) ? $data['message'] : VarDumper::export($data['message']));
                if (!empty($data['trace'])) {
                    $message .= Html::ul($data['trace'], [
                        'class' => 'trace',
                        'item' => function ($trace) {
                            return "<li>{$trace['file']} ({$trace['line']})</li>";
                        }
                    ]);
                };
                return $message;
            },
            'format' => 'raw',
            'options' => [
                'width' => '50%',
            ],
        ],
    ],
]);
