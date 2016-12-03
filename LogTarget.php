<?php

namespace amnah\yii2\debug;

class LogTarget extends \yii\debug\LogTarget
{
    /**
     * @inheritdoc
     */
    protected function collectSummary()
    {
        // get original summary data
        $summary = parent::collectSummary();

        // add in profiling data
        // we do it this way so that the number of files remains
        // consistent between the toolbar and the summary index data
        // this is emulating LogTarget::export()
        foreach ($this->module->panels as $id => $panel) {
            $data = $panel->save();
            if ($id == "profiling") {
                $summary["profilingTime"] = $data["time"];
                $summary["profilingMemory"] = $data["memory"];
                $summary["profilingNumFiles"] = $data["numFiles"];
                break;
            }
        }

        return $summary;
    }
}
