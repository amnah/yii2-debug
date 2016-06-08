<?php

namespace amnah\yii2\debug\panels;

use Yii;
use yii\debug\models\search\Profile;

class ProfilingPanel extends \yii\debug\panels\ProfilingPanel
{
    /**
     * @inheritdoc
     */
    public function getSummary()
    {
        return Yii::$app->view->render('panels/profile/summary', [
            'memory' => sprintf('%.3f MB', $this->data['memory'] / 1048576),
            'time' => number_format($this->data['time'] * 1000) . ' ms',
            'numFiles' => !empty($this->data["numFiles"]) ? "{$this->data["numFiles"]} files" : "",
            'panel' => $this
        ]);
    }

    /**
     * @inheritdoc
     */
    public function getDetail()
    {
        $searchModel = new Profile();
        $dataProvider = $searchModel->search(Yii::$app->request->getQueryParams(), $this->getModels());

        return Yii::$app->view->render('panels/profile/detail', [
            'panel' => $this,
            'dataProvider' => $dataProvider,
            'searchModel' => $searchModel,
            'memory' => sprintf('%.3f MB', $this->data['memory'] / 1048576),
            'time' => number_format($this->data['time'] * 1000) . ' ms',
            'numFiles' => !empty($this->data["numFiles"]) ? "{$this->data["numFiles"]} files" : "",
        ]);
    }

    /**
     * @inheritdoc
     */
    public function save()
    {
        $data = parent::save();
        $data["numFiles"] = count(get_included_files());
        return $data;
    }
}
